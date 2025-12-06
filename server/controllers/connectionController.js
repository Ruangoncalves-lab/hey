import { Connection } from '../models/index.js';
import { supabase } from '../config/supabase.js'; // Import Supabase client

export const getConnections = async (req, res) => {
    try {
        const connections = await Connection.find({ tenant_id: req.tenant._id });
        res.json(connections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createConnection = async (req, res) => {
    try {
        const { platform, access_token, account_id, account_name, user_id } = req.body; // Ensure user_id is passed

        // Check if connection already exists
        const existing = await Connection.findOne({
            tenant_id: req.tenant._id,
            platform,
            account_id
        });

        if (existing) {
            // Update token
            existing.access_token = access_token;
            existing.status = 'active';
            await existing.save();

            // Trigger initial sync via Edge Function
            if (platform === 'meta') {
                supabase.functions.invoke('meta-sync', {
                    body: { user_id: user_id || req.user._id } // Use provided user_id or authenticated user's ID
                }).catch(console.error);
            }

            return res.json(existing);
        }

        const connection = new Connection({
            tenant_id: req.tenant._id,
            user_id: user_id || req.user._id, // Store user_id with connection
            platform,
            access_token,
            account_id,
            account_name: account_name || `${platform} Account`,
            status: 'active'
        });

        await connection.save();

        // Trigger initial sync via Edge Function
        if (platform === 'meta') {
            supabase.functions.invoke('meta-sync', {
                body: { user_id: user_id || req.user._id }
            }).catch(console.error);
        }

        res.status(201).json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const listMetaPixels = async (req, res) => {
    try {
        const { access_token, account_id } = req.body;
        if (!access_token || !account_id) {
            return res.status(400).json({ message: 'Access token and Account ID are required' });
        }

        // MOCK DATA for now, until a dedicated Edge Function is created for listing pixels
        const pixels = [
            { id: 'pixel123', name: 'Main Website Pixel' },
            { id: 'pixel456', name: 'Secondary Pixel' },
        ];
        res.json(pixels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const syncConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const connection = await Connection.findOne({ _id: connectionId, tenant_id: req.tenant._id });

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        if (connection.platform === 'meta') {
            // Invoke the meta-sync Edge Function
            const { data, error } = await supabase.functions.invoke('meta-sync', {
                body: { user_id: connection.user_id }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            connection.last_synced_at = new Date();
            connection.status = 'active';
            await connection.save();

            return res.json({ message: 'Sync completed', result: data });
        }

        res.status(400).json({ message: 'Platform not supported for sync' });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ message: 'Sync failed: ' + error.message });
    }
};