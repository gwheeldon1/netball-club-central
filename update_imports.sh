#!/bin/bash
# Quick script to update all unifiedApi imports to api
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@\/services\/unifiedApi/@\/services\/api/g'