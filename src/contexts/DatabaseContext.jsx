import React, { createContext, useContext, useState, useEffect } from "react";
import Dexie from "dexie";

const DatabaseContext = createContext();

export function useDatabase() {
    return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
    const [documents, setDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [db, setDb] = useState(null);

    useEffect(() => {
        const initDB = async () => {
            try {
                const newDb = new Dexie("EditorStorage");
                newDb.version(1).stores({
                    documents: "id, name, content, timestamp",
                });
                await newDb.open();
                setDb(newDb);

                // Load documents after DB initialization
                const docs = await newDb.documents.orderBy("timestamp").reverse().toArray();
                setDocuments(docs);
                if (docs.length > 0) {
                    setCurrentDoc(docs[0]);
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Error initializing database:", err);
                setError(err);
                setIsLoading(false);
            }
        };

        initDB();

        return () => {
            if (db) {
                db.close();
            }
        };
    }, []);

    const saveDocument = async (doc) => {
        try {
            setIsLoading(true);
            await db.documents.put(doc);

            // Update local state
            const updatedDocs = await db.documents.orderBy("timestamp").reverse().toArray();
            setDocuments(updatedDocs);
            setCurrentDoc(doc);

            return true;
        } catch (err) {
            console.error("Error saving document:", err);
            setError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDocument = async (docId) => {
        try {
            setIsLoading(true);
            await db.documents.delete(docId);

            // Update local state
            const updatedDocs = await db.documents.orderBy("timestamp").reverse().toArray();
            setDocuments(updatedDocs);
            if (currentDoc?.id === docId) {
                setCurrentDoc(updatedDocs[0] || null);
            }

            return true;
        } catch (err) {
            console.error("Error deleting document:", err);
            setError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        documents,
        currentDoc,
        setCurrentDoc,
        isLoading,
        error,
        saveDocument,
        deleteDocument,
    };

    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}
