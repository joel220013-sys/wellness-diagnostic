import webPush from 'web-push';

const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BFM_bW4TKwTStNxt4lfrvviHeug1NVRIQQ4KzCC3QtlLxt7g4pwPl-_SNFf8ZIja5x2VCkJI9hvMZdFyj7cWIIE';

const vapidPrivateKey =
  process.env.VAPID_PRIVATE_KEY ||
  'xBeDKeZWcvlftaHfxJA5ooCjrQg9kedsGz4L5o-TbWU';

const vapidSubject =
  process.env.VAPID_SUBJECT ||
  'mailto:admin@wellnessdiagnosticcenter.in';

try {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (err) {
  console.warn('[WebPush] setVapidDetails warning:', err);
}

export { webPush, vapidPublicKey };

