import { Campaign, MetricsTimeseries } from '../models/index.js';
import { logAction } from '../utils/logger.js';
import { supabase } from '../config/supabase.js'; // Import the Supabase client

export const getCampaigns = async (req, res) => {
    try {
        const { status, objective } = req.query;
        const query = { tenant_id: req.params.tid };

        if (status) query.status = status;
        if (objective) query.objective = objective;

        const campaigns = await Campaign.find(query).sort({ created_at: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ _id: req.params.id, tenant_id: req.params.tid });
        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCampaign = async (req, res) => {
    try {
        const { platform, name, objective, budget, account_id } = req.body; // Ensure account_id is passed from frontend
        let externalId = `temp_${Date.now()}`;
        let status = 'DRAFT';

        if (platform === 'meta') {
            if (!account_id) {
                return res.status(400).json({ message: 'Meta Ad Account ID is required for Meta campaigns' });
            }

            // Invoke Edge Function to create campaign on Meta
            const { data: edgeFnData, error: edgeFnError } = await supabase.functions.invoke('meta-create-campaign', {
                body: {
                    user_id: req.user._id, // Assuming req.user is populated by auth middleware
                    account_id: account_id,
                    name: name,
                    objective: objective,
                    budget: budget // Pass the full budget object
                }
            });

            if (edgeFnError) {
                throw new Error(`Edge Function Invocation Error: ${edgeFnError.message}`);
            }
            if (edgeFnData?.error) {
                throw new Error(`Meta API Error from Edge Function: ${edgeFnData.error}`);
            }

            externalId = edgeFnData.external_id;
            status = edgeFnData.status; // Should be 'PAUSED' from the Edge Function
        }

        const campaign = new Campaign({
            ...req.body,
            tenant_id: req.params.tid,
            external_id: externalId,
            status: status
        });
        const createdCampaign = await campaign.save();

        await logAction(req.params.tid, req.user._id, 'create', 'campaign', createdCampaign._id, { name: createdCampaign.name });

        res.status(201).json(createdCampaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ _id: req.params.id, tenant_id: req.params.tid });

        if (campaign) {
            Object.assign(campaign, req.body);
            const updatedCampaign = await campaign.save();

            await logAction(req.params.tid, req.user._id, 'update', 'campaign', updatedCampaign._id, { changes: req.body });

            res.json(updatedCampaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTopCampaigns = async (req, res) => {
    try {
        // Example aggregation to find top campaigns by spend or conversions
        const campaigns = await Campaign.find({ tenant_id: req.params.tid })
            .sort({ 'performance_summary.spend': -1 })
            .limit(5);
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};