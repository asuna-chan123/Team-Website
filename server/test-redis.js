require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { client } = require('./redisClient');

async function test() {
  try {
    await client.connect();
    const keys = await client.keys('cart:*');
    console.log('--- Tất cả giỏ hàng hiện có trên Redis ---');
    if (keys.length === 0) {
      console.log('(Không có giỏ hàng nào trong Redis)');
    }
    for (const key of keys) {
      const data = await client.get(key);
      console.log(`Key: ${key}`);
      console.log('Data:', JSON.stringify(JSON.parse(data), null, 2));
      console.log('---------------------------------------');
    }
  } catch (err) {
    console.error('Lỗi khi truy vấn Redis:', err);
  } finally {
    await client.disconnect();
  }
}

test();
