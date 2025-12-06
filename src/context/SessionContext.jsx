import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Import the configured Supabase client

const SessionContext = createContext(null);

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                setSession(currentSession);
                setLoading(false);
            }
        );

        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            setSession(initialSession);
            setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <SessionContext.Provider value={{ session, loading, supabase }}>
            {children}
        </SessionContext.Provider>
    );
};