-- Enterprise Multi-Admin Management & Corporate Multi-Tenancy Migration

-- 1. ENUMS FOR SUB-ROLES & PERMISSIONS
CREATE TYPE public.admin_sub_role AS ENUM (
  'super_admin',
  'academic_admin',
  'finance_admin',
  'user_admin',
  'compliance_admin'
);

-- 2. ADMIN PERMISSIONS TABLE
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sub_role public.admin_sub_role NOT NULL DEFAULT 'super_admin',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO service_role;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.user_id = _user_id
      AND (
        ap.sub_role = 'super_admin'
        OR ap.permissions ? _permission
      )
  ) OR public.is_admin();
$$;

CREATE POLICY "admin_permissions_read" ON public.admin_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_permissions_write" ON public.admin_permissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER admin_permissions_updated BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. ENTERPRISE ORGANIZATIONS & COHORTS (B2B MULTI-TENANCY)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  max_seats INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT ON public.organizations TO anon;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_read" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "organizations_write_admin" ON public.organizations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER organizations_updated BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  org_role TEXT NOT NULL DEFAULT 'member', -- 'manager' or 'member'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read" ON public.organization_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_members_write_admin" ON public.organization_members FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cohorts TO authenticated;
GRANT ALL ON public.cohorts TO service_role;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cohorts_read" ON public.cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "cohorts_write_admin" ON public.cohorts FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER cohorts_updated BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED DEMO ENTERPRISE ORGANIZATIONS & ADMIN SUB-ROLES
INSERT INTO public.organizations (id, name, code, contact_email, domain, max_seats) VALUES
  ('11111111-0000-4000-8000-000000000001', 'KCB Group Executive Office', 'KCB-EXEC', 'corporate@kcbgroup.com', 'kcbgroup.com', 50),
  ('22222222-0000-4000-8000-000000000002', 'Safaricom Enterprise Services', 'SAF-ENT', 'training@safaricom.co.ke', 'safaricom.co.ke', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cohorts (id, organization_id, name, description, start_date, end_date) VALUES
  ('aaaaaaaa-1111-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001', 'KCB Senior Executive Assistants Cohort 2026', 'Executive assistance and governance training for C-suite assistants.', '2026-01-15', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
