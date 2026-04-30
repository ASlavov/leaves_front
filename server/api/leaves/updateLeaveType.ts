import { defineEventHandler, readBody, getHeader } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;
  const cookieHeader = getHeader(event, 'cookie') ?? '';

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const {
      id,
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
      autoApprove,
      monthlyAllocationDays,
    } = body;

    const response = await $fetch(
      `${config.public.apiBase}${config.public.leaves.updateLeaveType}`,
      {
        method: 'PUT',
        body: {
          leave_type_id: id,
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
          auto_approve: autoApprove ?? false,
          monthly_allocation_days: monthlyAllocationDays ?? null,
        },
        headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
      },
    );

    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
