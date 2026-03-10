#!/bin/sh
# 将模板中的占位符替换为环境变量，生成 kong.yml 后启动 Kong
set -e
if [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must be set" >&2
  exit 1
fi
sed "s|__SUPABASE_ANON_KEY__|$SUPABASE_ANON_KEY|g; s|__SUPABASE_SERVICE_ROLE_KEY__|$SUPABASE_SERVICE_ROLE_KEY|g" \
  /var/lib/kong/kong.yml.template > /tmp/kong.yml
export KONG_DECLARATIVE_CONFIG=/tmp/kong.yml
exec /docker-entrypoint.sh kong docker-start
