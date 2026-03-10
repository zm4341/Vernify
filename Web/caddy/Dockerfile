# Caddy Dockerfile
FROM caddy:2.7-alpine

# 复制配置文件
COPY Caddyfile /etc/caddy/Caddyfile

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
