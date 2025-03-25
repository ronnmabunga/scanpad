import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Dexie from "dexie";

const DatabaseContext = createContext(null);

// Create a function to initialize a new database instance
const createDatabase = () => {
    const db = new Dexie("EditorStorage");
    db.version(2).stores({
        documents: "++id, name, content, timestamp",
    });
    return db;
};

export const DatabaseProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [db, setDb] = useState(null);

    // Initialize database
    useEffect(() => {
        let isMounted = true;

        const initDb = async () => {
            try {
                // Delete the database to start fresh
                await Dexie.delete("EditorStorage");

                // Create and initialize a new database instance
                const newDb = createDatabase();
                await newDb.open();

                if (isMounted) {
                    setDb(newDb);
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Failed to initialize database:", error);
                if (isMounted) {
                    setError("Failed to initialize database. Please refresh the page.");
                }
            }
        };

        initDb();

        return () => {
            isMounted = false;
            if (db) {
                db.close();
            }
        };
    }, []);

    const saveDocument = useCallback(
        async (name, content) => {
            if (!isInitialized || !db) {
                throw new Error("Database not initialized");
            }

            setIsLoading(true);
            setError(null);
            try {
                const timestamp = new Date().toISOString();
                // First, try to find an existing document with the same name
                const existingDoc = await db.documents.where("name").equals(name.trim()).first();

                if (existingDoc) {
                    // Update existing document
                    await db.documents.update(existingDoc.id, {
                        content,
                        timestamp,
                    });
                } else {
                    // Create new document
                    await db.documents.add({
                        name: name.trim(),
                        content,
                        timestamp,
                    });
                }
                return true;
            } catch (error) {
                console.error("Error saving document:", error);
                setError(error.message || "Failed to save document");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [isInitialized, db]
    );

    const loadDocuments = useCallback(async () => {
        if (!isInitialized || !db) {
            throw new Error("Database not initialized");
        }

        setIsLoading(true);
        setError(null);
        try {
            const docs = await db.documents.orderBy("timestamp").reverse().toArray();
            return docs;
        } catch (error) {
            console.error("Error loading documents:", error);
            setError(error.message || "Failed to load documents");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [isInitialized, db]);

    const deleteDocument = useCallback(
        async (id) => {
            if (!isInitialized || !db) {
                throw new Error("Database not initialized");
            }

            setIsLoading(true);
            setError(null);
            try {
                await db.documents.delete(id);
                return true;
            } catch (error) {
                console.error("Error deleting document:", error);
                setError(error.message || "Failed to delete document");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [isInitialized, db]
    );

    const value = {
        isLoading,
        error,
        isInitialized,
        saveDocument,
        loadDocuments,
        deleteDocument,
    };

    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) {
        throw new Error("useDatabase must be used within a DatabaseProvider");
    }
    return context;
};

export default DatabaseContext;
