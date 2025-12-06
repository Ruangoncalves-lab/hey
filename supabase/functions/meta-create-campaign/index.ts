import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user_id, account_id, name, objective, budget } = await req.json()

        if (!user_id || !account_id || !name || !objective || !budget) {
            throw new Error('Missing required campaign parameters')
        }

        const META_GRAPH_VERSION = Deno.env.get('META_GRAPH_VERSION') || 'v20.0'
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Get Token
        const { data: tokenData, error: fetchError } = await supabase
            .from('meta_tokens')
            .select('long_lived_token')
            .eq('user_id', user_id)
            .single()

        if (fetchError || !tokenData) {
            throw new Error('Meta token not found for user')
        }

        const accessToken = tokenData.long_lived_token
        const actId = `act_${account_id}`

        // 2. Create Campaign on Meta
        const campaignCreationUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${actId}/campaigns`
        const campaignPayload = {
            name: name,
            objective: objective, // e.g., 'OUTCOME_SALES', 'OUTCOME_LEADS'
            status: 'PAUSED', // Start paused, can be changed later
            buying_type: 'AUCTION',
            special_ad_categories: [], // Add if needed
            access_token: accessToken
        }

        const createCampaignRes = await fetch(campaignCreationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campaignPayload)
        })
        const createCampaignData = await createCampaignRes.json()

        if (createCampaignData.error) {
            throw new Error(`Meta API Error (Create Campaign): ${createCampaignData.error.message}`)
        }

        const newCampaignId = createCampaignData.id

        // 3. Create Ad Set (simplified for now, just a basic one)
        const adSetCreationUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${actId}/adsets`
        const adSetPayload = {
            name: `${name} - AdSet 1`,
            campaign_id: newCampaignId,
            daily_budget: budget.amount, // Assuming budget.amount is daily
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS', // Or 'PURCHASE', 'LEAD' based on objective
            bid_amount: 100, // Example bid, adjust based on strategy
            targeting: { // Basic targeting
                geo_locations: {
                    countries: ['BR']
                }
            },
            status: 'PAUSED',
            access_token: accessToken
        }

        const createAdSetRes = await fetch(adSetCreationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adSetPayload)
        })
        const createAdSetData = await createAdSetRes.json()

        if (createAdSetData.error) {
            throw new Error(`Meta API Error (Create Ad Set): ${createAdSetData.error.message}`)
        }

        return new Response(
            JSON.stringify({
                success: true,
                external_id: newCampaignId,
                status: 'PAUSED', // Initial status
                message: 'Campaign and initial Ad Set created successfully on Meta'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})