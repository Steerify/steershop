-- Fix remaining function search paths
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT n.nspname as schema, p.proname as name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'check_feature_usage',
            'check_product_limit', 
            'claim_prize',
            'has_role',
            'increment_feature_usage',
            'order_exists',
            'product_available',
            'shop_has_valid_subscription',
            'shop_is_active',
            'update_updated_at_column'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', func_record.name, func_record.args);
    END LOOP;
END $$;