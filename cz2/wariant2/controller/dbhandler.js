const { MongoClient } = require('mongodb');

class MongoDBHandler {
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    async connect() {
        try {
            await this.client.connect();
            console.log("Connected to MongoDB");
            this.db = this.client.db(this.dbName);
        } catch (error) {
            console.error("MongoDB connection error:", error);
            throw error;
        }
    }

    async search(collectionName, query, param = null) {
        try {
            if (!this.db) {
                throw new Error("Database not connected. Call connect() first.");
            }
            const collection = this.db.collection(collectionName);
            const results = await collection.find(query).toArray();
            return param ? results: results[0];
        } catch (error) {
            console.error("Search error:", error);
            throw error;
        }
    }

    
    async insert(collectionName, data) {
        try {
            if (!this.db) {
                throw new Error("Database not connected. Call connect() first.");
            }
            const collection = this.db.collection(collectionName);
            const result = await collection.insertOne(data);
    
            return result.insertedId ? data : null;
        } catch (error) {
            console.error("Insert error:", error);
            throw error;
        }
    }

    async delete(collectionName, query) {
        try {
            if (!this.db) {
                throw new Error("Database not connected. Call connect() first.");
            }
            const collection = this.db.collection(collectionName);
            const result = await collection.deleteOne(query);  

            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }

            return result.deletedCount; 
        } catch (error) {
            console.error("Delete error:", error);
            throw error;
        }
    }

    
    async close() {
        try {
            await this.client.close();
            console.log("MongoDB connection closed");
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }


}

const dbHandler = new MongoDBHandler('mongodb://localhost:27017', 'agh_app');

module.exports = dbHandler;
