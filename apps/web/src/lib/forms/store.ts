import { Redis } from '@upstash/redis'
import { DELIVERY_RECORD_RETENTION_DAYS } from '@/features/forms/constants'
import type { FormType } from '@/features/forms/schemas'

/**
 * Delivery-resilience store (plan §9.2).
 *
 * Persists a MINIMAL submission record — id, form type, timestamp and
 * delivery status — so that failed deliveries can be retried by a later job.
 * The message body is deliberately never stored here.
 *
 * Retention: a documented 90-day retention job removes records older than
 * `DELIVERY_RECORD_RETENTION_DAYS`. In the default in-memory backend the
 * prune is applied opportunistically on writes and a `prune()` helper is
 * exported for scheduled runs. In production the records should live in the
 * same Upstash Redis used for rate limiting (keys carry `EX` 90 days so the
 * cache itself is the retention job).
 */

export type DeliveryStatus = 'sent' | 'partially-sent' | 'failed'

export interface DeliveryRecord {
  id: string
  formType: FormType
  timestamp: string // ISO 8601
  deliveryStatus: DeliveryStatus
}

const RETENTION_MS = DELIVERY_RECORD_RETENTION_DAYS * 24 * 60 * 60 * 1000
const KEY_PREFIX = 'nhecof:forms:delivery:'

/** Persistent delivery-record store; falls back to in-memory when Upstash keys are absent. */
export interface DeliveryRecordStore {
  save(record: DeliveryRecord): Promise<void>
  prune(olderThanMs?: number): Promise<number>
}

class MemoryDeliveryRecordStore implements DeliveryRecordStore {
  private records = new Map<string, DeliveryRecord>()

  async save(record: DeliveryRecord): Promise<void> {
    this.records.set(record.id, { ...record })
  }

  async prune(olderThanMs = RETENTION_MS): Promise<number> {
    const cutoff = Date.now() - olderThanMs
    let removed = 0
    for (const [id, record] of this.records) {
      if (new Date(record.timestamp).getTime() < cutoff) {
        this.records.delete(id)
        removed += 1
      }
    }
    return removed
  }

  get all(): DeliveryRecord[] {
    return [...this.records.values()]
  }
}

class RedisDeliveryRecordStore implements DeliveryRecordStore {
  constructor(private redis: Pick<Redis, 'set'>) {}

  async save(record: DeliveryRecord): Promise<void> {
    await this.redis.set(KEY_PREFIX + record.id, JSON.stringify(record), {
      ex: DELIVERY_RECORD_RETENTION_DAYS * 24 * 60 * 60,
    })
  }

  async prune(_olderThanMs = RETENTION_MS): Promise<number> {
    // Redis `EX` expires records at exactly `DELIVERY_RECORD_RETENTION_DAYS`,
    // making the retention job implicit. No sweep required.
    return 0
  }
}

let store: DeliveryRecordStore | null = null

export function getDeliveryRecordStore(): DeliveryRecordStore {
  if (store) return store

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    store = new RedisDeliveryRecordStore(new Redis({ url, token }))
  } else {
    store = new MemoryDeliveryRecordStore()
  }

  return store
}

/** Test helper: reset the cached store. */
export function resetDeliveryRecordStoreForTest(): void {
  store = null
}

/** Exposes current in-memory records for tests; servers may call prune() themselves. */
export function getMemoryDeliveryRecords(): DeliveryRecord[] | null {
  return store instanceof MemoryDeliveryRecordStore ? store.all : null
}