import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Tambahkan ke .env / Vercel:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:hello@wang.web.id");
console.log("CRON_SECRET=<random-string-panjang>");
