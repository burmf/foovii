import { createClient } from "@supabase/supabase-js";
import { loadEnvFile } from "./utils/load-env";

loadEnvFile();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function check() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, store_slug")
        .eq("store_slug", "southern-xross")
        .limit(10);

    if (error) {
        console.error('Supabase error:', error);
        return;
    }
    console.log('Items for southern-xross:', JSON.stringify(data, null, 2));
}

check();
