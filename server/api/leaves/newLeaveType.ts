import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const {
      name,
      dependsOnTypeId,
      allowRollover,
      priorityLevel,
      allowWalletOverflow,
      overflowLeaveTypeId,
      accrualType,
      allowNegativeBalance,
      maxNegativeBalance,
      isHourly,
      hoursPerDay,
      attachmentRequiredAfterDays,
    } = body;

    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.newLeaveType}`, {
      method: 'POST',
      body: {
        leave_type_name: name,
        depends_on_type_id: dependsOnTypeId ?? null,
        allow_rollover: allowRollover !== false,
        priority_level: priorityLevel ?? 10,
        allow_wallet_overflow: allowWalletOverflow ?? false,
        overflow_leave_type_id: overflowLeaveTypeId ?? null,
        accrual_type: accrualType ?? 'upfront',
        allow_negative_balance: allowNegativeBalance ?? false,
        max_negative_balance: maxNegativeBalance ?? 0,
        is_hourly: isHourly ?? false,
        hours_per_day: hoursPerDay ?? 8,
        attachment_required_after_days: attachmentRequiredAfterDays ?? null,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
