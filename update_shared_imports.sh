#!/bin/bash
# Script to update imports to use shared packages

echo "Updating Button imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/components/ui/button"|from "@netball/shared-ui"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/components/ui/button'\''|from '\''@netball/shared-ui'\''|g'

echo "Updating Input imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/components/ui/input"|from "@netball/shared-ui"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/components/ui/input'\''|from '\''@netball/shared-ui'\''|g'

echo "Updating Card imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/components/ui/card"|from "@netball/shared-ui"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/components/ui/card'\''|from '\''@netball/shared-ui'\''|g'

echo "Updating Badge imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/components/ui/badge"|from "@netball/shared-ui"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/components/ui/badge'\''|from '\''@netball/shared-ui'\''|g'

echo "Updating Dialog imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/components/ui/dialog"|from "@netball/shared-ui"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/components/ui/dialog'\''|from '\''@netball/shared-ui'\''|g'

echo "Updating type imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/types/|from "@netball/shared-types/|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/types/|from '\''@netball/shared-types/|g'

echo "Updating utility imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/utils/|from "@netball/shared-utils/|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from '\''@/utils/|from '\''@netball/shared-utils/|g'

echo "Import updates completed!"