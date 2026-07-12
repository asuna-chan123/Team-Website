const redis = require('redis');

async function seedData() {
  const client = redis.createClient();
  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  const userId = "6679b3a1e4b0c8d1a3333333";
  const cartKey = `cart:${userId}`;

  const items = [
    {
      productId: "6679b3a1e4b0c8d1a1111111",
      name: "iPhone 15 Pro Max",
      price: 150000,
      quantity: 1,
      image: "iphone15pm.jpg"
    },
    {
      productId: "6679b3a1e4b0c8d1a2222222",
      name: "MacBook Pro 16",
      price: 300000,
      quantity: 2,
      image: "macbookpro.jpg"
    }
  ];

  for (const item of items) {
    await client.hSet(cartKey, item.productId, JSON.stringify(item));
  }

  const result = await client.hGetAll(cartKey);
  console.log("Cart contents seeded successfully!");
  console.log(result);

  await client.disconnect();
}

seedData();
