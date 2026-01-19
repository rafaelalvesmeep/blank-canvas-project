-- Add new sector values to app_sector enum
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'administrativo';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'canais';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'compras';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'cs';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'eventos';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'implantacao';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'integracoes';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'logistica';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'produto';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'prospeccao';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'rh';
ALTER TYPE public.app_sector ADD VALUE IF NOT EXISTS 'suporte_tecnico';