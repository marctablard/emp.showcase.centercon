'use client'

import client from '@/platform/client';

export const getService = <T>(serviceId: string): T => {
    return client.get<T>(serviceId)
}
