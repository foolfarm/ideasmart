export type NewsletterOperationalStatusInput = {
  automationsPaused: boolean;
  sendGridConfigured: boolean;
  subscribers: Array<{ status: string }>;
};

/**
 * Returns only non-sensitive operational facts required by the admin control room.
 * The control room deliberately never exposes or enables a mass-send action.
 */
export function buildNewsletterOperationalStatus({
  automationsPaused,
  sendGridConfigured,
  subscribers,
}: NewsletterOperationalStatusInput) {
  return {
    automationsPaused,
    sendGridConfigured,
    activeSubscribers: subscribers.filter((subscriber) => subscriber.status === "active").length,
    unsubscribeProtection: true,
    trackingAvailable: true,
    massSendEnabled: false,
  } as const;
}
