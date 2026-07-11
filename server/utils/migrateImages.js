const mongoose = require('mongoose');
const path = require('path');

const IMAGE_MAPPING = {
  's24u-1.jpg': 'Samsung Galaxy S24 Ultra 256GB.jpg',
  's24u-2.jpg': 'Samsung Galaxy S24 Ultra 256GB (2).jpg',
  'pixel-8-pro-1.jpg': 'Google Pixel 8 Pro 128GB.jpg',
  'pixel-8-pro-2.jpg': 'Google Pixel 8 Pro 128GB (2).jpg',
  'xiaomi-14-u-1.jpg': 'Xiaomi 14 Ultra 512GB.jpg',
  'xiaomi-14-u-2.jpg': 'Xiaomi 14 Ultra 512GB (2).jpg',
  'ipad-pro-m4-11-1.jpg': 'iPad Pro M4 11.jpg',
  'ipad-pro-m4-11-2.jpg': 'iPad Pro M4 11 (2).jpg',
  'tabs9u-1.jpg': 'Samsung Galaxy Tab S9 Ultra.jpg',
  'tabs9u-2.jpg': 'Samsung Galaxy Tab S9 Ultra (2).jpg',
  'rog-g16-main.jpg': 'ASUS ROG Zephyrus G16.jpg',
  'rog-g16-2.jpg': 'ASUS ROG Zephyrus G16 (2).jpg',
  'katana-15-main.jpg': 'Lenovo Legion Pro 5.jpg',
  'helios16-main.jpg': 'Dell XPS 15.jpg',
  'legion5-main.jpg': 'MacBook Pro M3 Pro 14.jpg',
  'anker-65w.jpg': 'Sạc nhanh Anker 65W GaN.jpg',
  'anker-65w-2.jpg': 'Sạc nhanh Anker 65W GaN (2).jpg',
  'baseus-100w.jpg': 'Cáp USB-C Baseus 100W.jpg',
  'baseus-100w-2.jpg': 'Cáp USB-C Baseus 100W (2).jpg',
  'apple-20w.jpg': 'Pin dự phòng Xiaomi 20000mAh.jpg',
  'apple-20w-2.jpg': 'Pin dự phòng Xiaomi 20000mAh (2).jpg',
  'airpods-pro-gen-2.jpg': 'airpods-pro-gen-2.jpg',
  'sony-wh-1000xm5.jpg': 'Sony WH-1000XM5.jpg',
  'sony-wh-1000xm5-2.jpg': 'Sony WH-1000XM5 (2).jpg',
  'jbl-charge5.jpg': 'JBL Live Pro 2 TWS.jpg',
  'marshall-motif2-main.jpg': 'Tai nghe True Wireless Marshall Motif II A.N.C.jpg',
  'marshall-motif2-2.jpg': 'Tai nghe True Wireless Marshall Motif II A.N.C (2).jpg',
  'apple-watch-9.jpg': 'Apple Watch Series 9 GPS 41mm.jpg',
  'apple-watch-9-2.jpg': 'Apple Watch Series 9 GPS 41mm (2).jpg',
  'galaxy-watch-6.jpg': 'Garmin Venu 3.jpg',
  'garmin-venu3.jpg': 'Garmin Venu 3.jpg',
  'garmin-venu3-2.jpg': 'Garmin Venu 3 (2).jpg'
};

const getCleanedFilename = (imgStr) => {
  if (!imgStr) return '';
  let filename = '';
  const idxPublic = imgStr.indexOf('public');
  if (idxPublic !== -1) {
    filename = path.basename(imgStr.substring(idxPublic + 6));
  } else {
    filename = path.basename(imgStr);
  }
  if (IMAGE_MAPPING[filename]) {
    filename = IMAGE_MAPPING[filename];
  }
  return filename;
};

mongoose.connect('mongodb://127.0.0.1:27017/online_ordering_system')
  .then(async () => {
    console.log('Kết nối thành công MongoDB để di trú hình ảnh...');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();

    console.log(`Đang xử lý di trú ${products.length} sản phẩm...`);

    for (const product of products) {
      // Xử lý mảng images
      const origImages = Array.isArray(product.images) ? product.images : [];
      const newImages = origImages.map(img => {
        const fname = getCleanedFilename(img);
        return fname ? `/images/products/${fname}` : '';
      }).filter(Boolean);

      // Xử lý trường image đơn
      let newImage = '';
      if (product.image) {
        const fname = getCleanedFilename(product.image);
        newImage = fname ? `/images/products/${fname}` : '';
      } else if (newImages.length > 0) {
        newImage = newImages[0];
      }

      // Cập nhật lại sản phẩm trong database
      await productsCollection.updateOne(
        { _id: product._id },
        {
          $set: {
            images: newImages,
            image: newImage
          }
        }
      );

      console.log(`- Đã cập nhật sản phẩm: ${product.name}`);
    }

    console.log('\nDi trú dữ liệu hình ảnh thành công! [OK]');
    process.exit(0);
  })
  .catch(err => {
    console.error('Lỗi khi di trú cơ sở dữ liệu:', err);
    process.exit(1);
  });
