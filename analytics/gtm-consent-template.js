// GTM sandbox-template Code, not a website script. See ANALYTICS-HANDOFF-ru.md.
const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const callInWindow = require('callInWindow');

setDefaultConsentState({
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});

const current = callInWindow('ANGELS_ANALYTICS.getGoogleConsent');
if (current) updateConsentState(current);
callInWindow('ANGELS_ANALYTICS.onConsentChange', function (state) {
  updateConsentState(state);
});
data.gtmOnSuccess();
