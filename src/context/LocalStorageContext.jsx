import { createContext, useCallback, useMemo, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
const LocalStorageContext = createContext();
const STORAGE_KEY_PREFIX = "ririStorage-app";

// Context Component that serves as temporary storage of data about the application and the user's session.
export const LocalStorageProvider = ({ children }) => {
    const navigate = useNavigate();
    const [updateFlag, setUpdateFlag] = useState(0); // Used to trigger re-renders when data changes
    const [dataLoading, setDataLoading] = useState(0); // Used to trigger re-renders when data changes
    const isDev = localStorage.getItem("dev") === "asd3rAKSJDAUSD)(";
    // Function to get a value from localStorage
    const getItem = useCallback((key) => {
        const combinedKey = `${STORAGE_KEY_PREFIX}-${key}`;
        try {
            const storedData = localStorage.getItem(combinedKey);
            return storedData ? JSON.parse(storedData) : undefined;
        } catch (error) {
            if (isDev) console.error("Error reading from localStorage:", error);
            return undefined;
        }
    }, []);

    // const saveUserData = useCallback(() => {
    //     if (localStorage.getItem("token")) {
    //         console.log("here");
    //         const localData = JSON.stringify(localStorage);
    //         async function saveUserDataToDB() {
    //             setDataLoading(true);
    //             await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
    //                 method: "PATCH",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //                 },
    //                 body: JSON.stringify({
    //                     userData: localData,
    //                 }),
    //             })
    //                 .then((res) => res.json())
    //                 .then((data) => {
    //                     if (data.hasOwnProperty("message") && data.message === "User updated successfully.") {
    //                     } else if (data.hasOwnProperty("error")) {
    //                     } else {
    //                         // unknown error
    //                     }
    //                 })
    //                 .catch((error) => {});
    //             setDataLoading(false);
    //         }
    //         saveUserDataToDB();
    //     }
    // }, [getItem]);
    // const loadUserData = useCallback(() => {
    //     async function loadUserDataFromDB() {
    //         setDataLoading(true);
    //         await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/`, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
    //             },
    //         })
    //             .then((res) => res.json())
    //             .then((data) => {
    //                 if (data.hasOwnProperty("message") && data.message === "User data found.") {
    //                     const loadedData = JSON.parse(data.user.userData);
    //                     if (loadedData.timeStamp > getItem("timestamp")) {
    //                         try {
    //                             Object.entries(loadedData).forEach(([key, value]) => {
    //                                 if (localStorage.getItem(key)) {
    //                                 }
    //                                 localStorage.setItem(key, value);
    //                             });
    //                             alert("Loading user data successful");
    //                             window.location.reload();
    //                         } catch (error) {
    //                             alert("Loading user data failed");
    //                         }
    //                     }
    //                 } else if (data.hasOwnProperty("error")) {
    //                     alert("Loading user data successful on server");
    //                 } else {
    //                     alert("Loading user data successful on server (unknown error)");
    //                     // unknown error
    //                 }
    //             })
    //             .catch((error) => {});
    //         setDataLoading(false);
    //     }
    //     loadUserDataFromDB();
    //     saveUserData();
    // }, [getItem, saveUserData]);

    // Function to set a value in localStorage safely
    const setItem = useCallback((key, value) => {
        const combinedKey = `${STORAGE_KEY_PREFIX}-${key}`;
        try {
            localStorage.setItem("timestamp", new Date().toISOString().replace(/[-T:]/g, "").split(".")[0]);
            localStorage.setItem(combinedKey, JSON.stringify(value));
            window.dispatchEvent(new Event("localStorageUpdated")); // Notify same-tab updates
            // saveUserData();
        } catch (error) {
            if (isDev) console.error("Error writing to localStorage:", error);
        }
    }, []);

    // Multi-tab synchronization: Listen for storage events from other tabs
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key && event.key.startsWith(STORAGE_KEY_PREFIX)) {
                setUpdateFlag((prev) => prev + 1); // Trigger re-render
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Function to generate filename with timestamp
    const getTimestampedFilename = () => {
        const now = new Date();
        const formattedDate = now.toISOString().replace(/[-T:]/g, "").split(".")[0]; // Removes separators & milliseconds
        return `ririSource_${formattedDate}.json`;
    };
    // Save localStorage data to a file
    const saveToFile = useCallback(() => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = getTimestampedFilename(); // Use timestamped filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);
    // Load localStorage data from a file
    const loadFromFile = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    Object.entries(loadedData).forEach(([key, value]) => {
                        localStorage.setItem(key, value);
                    });
                    alert("User data loaded successfully!");
                    // Wait 2 seconds before navigating
                    navigate("/characters");
                    window.location.reload();
                } catch (error) {
                    console.error("Invalid JSON file", error);
                    alert("Invalid or corrupted file!");
                }
            };
            reader.readAsText(file);
        },
        [navigate]
    );
    const contextValues = useMemo(
        () => ({
            // loadUserData,
            dataLoading,
            setDataLoading,
            getItem,
            setItem,
            updateFlag,
            saveToFile,
            loadFromFile,
        }),
        [
            // loadUserData,
            dataLoading,
            setDataLoading,
            getItem,
            setItem,
            updateFlag,
            saveToFile,
            loadFromFile,
        ]
    );

    return <LocalStorageContext.Provider value={contextValues}>{children}</LocalStorageContext.Provider>;
};

export default LocalStorageContext;
