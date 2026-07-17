require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const connectDB = require('./db');
const Product = require('./models/product.model');

async function test() {
  await connectDB();
  const product = await Product.findById("6a5a1e0cee06424ac7948298").lean();
  console.log("Product from DB:", JSON.stringify(product, null, 2));
  process.exit(0);
}

test();
