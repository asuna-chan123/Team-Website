const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MockQuery {
  constructor(promise) {
    this.promise = promise;
  }
  sort(sortQuery) {
    this.promise = this.promise.then(data => {
      if (!Array.isArray(data)) return data;
      const sorted = [...data];
      const key = Object.keys(sortQuery || {})[0];
      if (!key) return sorted;
      const order = sortQuery[key];
      sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        if (typeof valA === 'string') {
          return order === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return order === 1 ? (valA - valB) : (valB - valA);
      });
      return sorted;
    });
    return this;
  }
  limit(n) {
    this.promise = this.promise.then(data => {
      if (!Array.isArray(data)) return data;
      return data.slice(0, n);
    });
    return this;
  }
  populate() { return this; }
  lean() { return this; }
  async exec() {
    return this.promise;
  }
  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }
}

class MockModel {
  constructor(modelName, schema) {
    this.modelName = modelName;
    this.filePath = path.join(__dirname, '..', 'data', `${modelName.toLowerCase()}s.json`);
    
    // Ensure data directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Ensure file exists and seed if empty
    if (!fs.existsSync(this.filePath)) {
      this._seedInitialData();
    } else {
      // If file exists but is empty array, also seed
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        if (data.length === 0) {
          this._seedInitialData();
        }
      } catch {
        this._seedInitialData();
      }
    }
  }

  _seedInitialData() {
    let initialData = [];
    try {
      if (this.modelName === 'Category') {
        const categoriesData = require('./mockCategories.json');
        initialData = categoriesData.map(name => ({
          _id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }));
      } else if (this.modelName === 'Product') {
        const productsData = require('./mockProducts.json');
        initialData = productsData.map(prod => {
          const categorySlug = prod.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return {
            _id: prod.slug || prod.id || crypto.randomBytes(12).toString('hex'),
            name: prod.name,
            slug: prod.slug || prod.id,
            description: prod.description || '',
            price: prod.price,
            image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
            images: prod.images || [],
            categoryId: categorySlug,
            categoryName: prod.category,
            brand: prod.brand || '',
            stock: prod.stock || 10,
            rating: 4.5,
            isFeatured: prod.isFeatured || false,
            colors: prod.color ? [prod.color] : [],
            specifications: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });
      }
    } catch (e) {
      console.error(`Error seeding mock data for ${this.modelName}:`, e);
    }
    fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2));
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  find(query = {}) {
    const p = Promise.resolve().then(() => {
      const data = this._read();
      return data.filter(item => {
        for (let key in query) {
          if (key === '$or') {
            return query.$or.some(subQuery => {
              for (let subKey in subQuery) {
                const queryVal = subQuery[subKey];
                const itemVal = item[subKey];
                if (queryVal && typeof queryVal === 'object' && queryVal.$regex) {
                  const regex = new RegExp(queryVal.$regex, queryVal.$options || '');
                  if (!regex.test(itemVal || '')) return false;
                  continue;
                }
                if (itemVal !== queryVal) return false;
              }
              return true;
            });
          }
          const queryVal = query[key];
          const itemVal = item[key];
          if (queryVal && typeof queryVal === 'object' && queryVal.$regex) {
            const regex = new RegExp(queryVal.$regex, queryVal.$options || '');
            if (!regex.test(itemVal || '')) return false;
            continue;
          }
          if (itemVal !== queryVal) return false;
        }
        return true;
      });
    });
    return new MockQuery(p);
  }

  findOne(query = {}) {
    const p = Promise.resolve().then(() => {
      const data = this._read();
      const found = data.find(item => {
        for (let key in query) {
          if (key === '$or') {
            return query.$or.some(subQuery => {
              for (let subKey in subQuery) {
                if (item[subKey] !== subQuery[subKey]) return false;
              }
              return true;
            });
          }
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      return found ? this._wrapDoc(found) : null;
    });
    return new MockQuery(p);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this._read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const updatedDoc = { ...data[index] };
    const updateData = update.$set || update;
    for (let key in updateData) {
      updatedDoc[key] = updateData[key];
    }
    
    data[index] = updatedDoc;
    this._write(data);
    return this._wrapDoc(updatedDoc);
  }

  async findOneAndDelete(query = {}) {
    const data = this._read();
    const index = data.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return null;
    const deleted = data.splice(index, 1)[0];
    this._write(data);
    return this._wrapDoc(deleted);
  }

  async create(doc) {
    const data = this._read();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.push(newDoc);
    this._write(data);
    return this._wrapDoc(newDoc);
  }

  async countDocuments() {
    return this._read().length;
  }

  _wrapDoc(doc) {
    const self = this;
    return {
      ...doc,
      toObject: function() { return { ...this }; },
      save: async function() {
        const data = self._read();
        const index = data.findIndex(item => item._id === this._id);
        const savedDoc = { ...this, updatedAt: new Date().toISOString() };
        // Delete helper methods before saving
        delete savedDoc.toObject;
        delete savedDoc.save;
        if (index !== -1) {
          data[index] = savedDoc;
        } else {
          data.push(savedDoc);
        }
        self._write(data);
        return self._wrapDoc(savedDoc);
      }
    };
  }
}

module.exports = MockModel;
