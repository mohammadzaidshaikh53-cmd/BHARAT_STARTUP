
$root = "src"
$domains = "auth", "users", "organizations", "verification", "trust", "marketplace", "rfq", "escrow", "orders", "contracts", "logistics", "payments", "disputes", "feed", "chat", "community", "expos", "booths", "ticketing", "moderation", "analytics", "notifications", "subscriptions", "search"
$domainSubfolders = "components", "hooks", "services", "repositories", "actions", "validators", "schemas", "dto", "utils", "constants", "types", "permissions", "workflows", "events", "state", "tests"
$workflows = "rfq-to-order", "escrow-release", "supplier-onboarding", "organization-verification", "dispute-resolution", "shipment-confirmation", "expo-onboarding", "booth-approval", "moderation-review"
$server = "api", "services", "rpc", "cache", "queues", "jobs", "cron", "logging", "telemetry", "metrics", "observability", "security"
$realtime = "websocket", "subscriptions", "presence", "events", "broadcast", "pubsub", "notifications", "scaling"
$ai = "moderation", "fraud-detection", "recommendations", "trust-scoring", "semantic-search", "matchmaking", "spam-detection", "risk-analysis", "ranking"
$infra = "database", "redis", "elasticsearch", "storage", "queues", "email", "sms", "payments", "analytics", "monitoring", "feature-flags", "cdn"
$shared = "ui", "hooks", "types", "constants", "utils", "validators", "schemas", "themes", "permissions", "security"
$otherRoot = "integrations", "engine", "config", "tests", "docs", "scripts"

if (!(Test-Path $root)) { New-Item -ItemType Directory -Path $root }

foreach ($d in $domains) {
    $dPath = "$root\domains\$d"
    if (!(Test-Path $dPath)) { New-Item -ItemType Directory -Path $dPath -Force }
    foreach ($sub in $domainSubfolders) {
        $subPath = "$dPath\$sub"
        if (!(Test-Path $subPath)) { New-Item -ItemType Directory -Path $subPath -Force }
    }
}

foreach ($w in $workflows) {
    $wPath = "$root\workflows\$w"
    if (!(Test-Path $wPath)) { New-Item -ItemType Directory -Path $wPath -Force }
}

foreach ($s in $server) {
    $sPath = "$root\server\$s"
    if (!(Test-Path $sPath)) { New-Item -ItemType Directory -Path $sPath -Force }
}

foreach ($r in $realtime) {
    $rPath = "$root\realtime\$r"
    if (!(Test-Path $rPath)) { New-Item -ItemType Directory -Path $rPath -Force }
}

foreach ($a in $ai) {
    $aPath = "$root\ai\$a"
    if (!(Test-Path $aPath)) { New-Item -ItemType Directory -Path $aPath -Force }
}

foreach ($i in $infra) {
    $iPath = "$root\infrastructure\$i"
    if (!(Test-Path $iPath)) { New-Item -ItemType Directory -Path $iPath -Force }
}

foreach ($sh in $shared) {
    $shPath = "$root\shared\$sh"
    if (!(Test-Path $shPath)) { New-Item -ItemType Directory -Path $shPath -Force }
}

foreach ($o in $otherRoot) {
    $oPath = "$root\$o"
    if (!(Test-Path $oPath)) { New-Item -ItemType Directory -Path $oPath -Force }
}
