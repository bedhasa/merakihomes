import { api } from './api';
import type { Service, Worker } from './types';

type DirectoryResult = { workers: Worker[]; demoData?: boolean };

export async function loadWorkerDirectory(services: Service[], serviceId = 'all'): Promise<DirectoryResult> {
  const path = `/workers${serviceId === 'all' ? '' : `?serviceId=${encodeURIComponent(serviceId)}`}`;
  let directoryError: unknown;
  try {
    return await api<DirectoryResult>(path, {}, false);
  } catch (error) {
    // Older or separately hosted backends may not yet have the directory route.
    if (!(error instanceof Error) || !error.message.includes('(404)')) throw error;
    directoryError = error;
  }

  const selectedServices = serviceId === 'all' ? services : services.filter(service => service.id === serviceId);
  if (!selectedServices.length) return { workers: [] };
  const requestedStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
  requestedStart.setHours(9, 0, 0, 0);
  const results = await Promise.allSettled(selectedServices.map(service => api<{ workers: Worker[]; demoData?: boolean }>(
    `/workers/eligible?serviceId=${encodeURIComponent(service.id)}&requestedStart=${encodeURIComponent(requestedStart.toISOString())}&durationMinutes=${service.durationMinutes || 60}`,
    {},
    false,
  )));
  const successful = results.filter((result): result is PromiseFulfilledResult<{ workers: Worker[]; demoData?: boolean }> => result.status === 'fulfilled');
  if (!successful.length) {
    const firstFailure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    throw firstFailure?.reason ?? directoryError;
  }
  const byId = new Map<string, Worker>();
  for (const result of successful) for (const worker of result.value.workers) byId.set(worker.id, worker);
  const workers = [...byId.values()].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount);
  return { workers, demoData: workers.some(worker => worker.isDemo) };
}
