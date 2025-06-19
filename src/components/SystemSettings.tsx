
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Settings, Database, Mail, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_type: typeof value === 'boolean' ? 'boolean' : 'string'
        });

      if (error) throw error;

      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.setting_key === key 
            ? { ...setting, setting_value: value }
            : setting
        )
      );

      toast({
        title: "Success",
        description: "Setting updated successfully"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (key: string) => {
    return settings.find(s => s.setting_key === key)?.setting_value || '';
  };

  const settingsGroups = [
    {
      title: "General Settings",
      icon: Settings,
      items: [
        { key: "app_name", label: "Application Name", type: "text", description: "The name of your application" },
        { key: "app_description", label: "Application Description", type: "textarea", description: "Brief description of your application" },
        { key: "contact_email", label: "Contact Email", type: "email", description: "Primary contact email address" },
        { key: "support_phone", label: "Support Phone", type: "text", description: "Support phone number" },
      ]
    },
    {
      title: "Registration Settings", 
      icon: Shield,
      items: [
        { key: "auto_approve_users", label: "Auto-approve Users", type: "boolean", description: "Automatically approve new user registrations" },
        { key: "require_photo_consent", label: "Require Photo Consent", type: "boolean", description: "Require photo consent during registration" },
        { key: "min_age_requirement", label: "Minimum Age", type: "number", description: "Minimum age for registration" },
        { key: "max_teams_per_player", label: "Max Teams Per Player", type: "number", description: "Maximum number of teams a player can join" },
      ]
    },
    {
      title: "Email Settings",
      icon: Mail,
      items: [
        { key: "smtp_host", label: "SMTP Host", type: "text", description: "SMTP server hostname" },
        { key: "smtp_port", label: "SMTP Port", type: "number", description: "SMTP server port" },
        { key: "smtp_username", label: "SMTP Username", type: "text", description: "SMTP authentication username" },
        { key: "from_email", label: "From Email", type: "email", description: "Default sender email address" },
      ]
    },
    {
      title: "Data Settings",
      icon: Database,
      items: [
        { key: "backup_frequency_days", label: "Backup Frequency (Days)", type: "number", description: "How often to backup data" },
        { key: "data_retention_months", label: "Data Retention (Months)", type: "number", description: "How long to keep historical data" },
        { key: "enable_analytics", label: "Enable Analytics", type: "boolean", description: "Enable application analytics tracking" },
        { key: "log_level", label: "Log Level", type: "select", options: ["error", "warn", "info", "debug"], description: "Application logging level" },
      ]
    }
  ];

  const renderSettingInput = (item: any) => {
    const value = getSetting(item.key);

    switch (item.type) {
      case 'boolean':
        return (
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => updateSetting(item.key, checked.toString())}
            disabled={saving}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateSetting(item.key, e.target.value)}
            placeholder={item.description}
            disabled={saving}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => updateSetting(item.key, newValue)}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${item.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            type={item.type}
            value={value}
            onChange={(e) => updateSetting(item.key, e.target.value)}
            placeholder={item.description}
            disabled={saving}
          />
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading system settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {settingsGroups.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {group.items.map((item) => (
                <div key={item.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <Label htmlFor={item.key} className="font-medium">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    {renderSettingInput(item)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
