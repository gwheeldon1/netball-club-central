import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

// Raw type from Supabase for system_settings table
interface RawSystemSetting {
  id: string;
  setting_key: string | null;
  setting_value: string | null;
  setting_type: string | null;
  description: string | null;
  created_at?: string | null; // Supabase might return these
  updated_at?: string | null;
  created_by?: string | null;
}

// Application-level type
interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string; // Expects non-nullable string
}

// Mapper function
function mapRawToSystemSetting(rawSetting: RawSystemSetting): SystemSetting {
  return {
    id: rawSetting.id,
    setting_key: rawSetting.setting_key || 'unknown_key',
    setting_value: rawSetting.setting_value || '',
    setting_type: rawSetting.setting_type || 'string',
    description: rawSetting.description || '', // Handle null description
  };
}

export const SystemSettings = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      const rawSettings = data as RawSystemSetting[] || [];
      setSettings(rawSettings.map(mapRawToSystemSetting));
    } catch (error) {
      logger.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, newValue: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey);

      if (error) throw error;

      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ));

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      logger.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (setting: SystemSetting, value: string) => {
    if (setting.setting_type === 'number') {
      if (setting.setting_key === 'monthly_subscription_price_pence') {
        // Convert from pounds to pence
        const pounds = parseFloat(value);
        const pence = Math.round(pounds * 100);
        updateSetting(setting.setting_key, pence.toString());
      } else {
        updateSetting(setting.setting_key, value);
      }
    } else {
      updateSetting(setting.setting_key, value);
    }
  };

  useEffect(() => {
    if (hasRole('admin')) {
      loadSettings();
    }
  }, [hasRole]);

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You don't have permission to access system settings.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <Label htmlFor={setting.setting_key} className="font-medium">
              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            <div className="flex gap-2">
              <Input
                id={setting.setting_key}
                type={setting.setting_type === 'number' ? 'number' : 'text'}
                value={
                  setting.setting_key === 'monthly_subscription_price_pence'
                    ? (parseInt(setting.setting_value) / 100).toFixed(2)
                    : setting.setting_value
                }
                onChange={(e) => handleValueChange(setting, e.target.value)}
                step={setting.setting_key === 'monthly_subscription_price_pence' ? '0.01' : undefined}
                min={setting.setting_type === 'number' ? '0' : undefined}
                disabled={saving}
                className="flex-1"
              />
              {setting.setting_key === 'monthly_subscription_price_pence' && (
                <div className="flex items-center px-3 bg-muted text-muted-foreground rounded-md text-sm">
                  per month
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{setting.description}</p>
          </div>
        ))}
        
        <div className="pt-4">
          <Button 
            onClick={loadSettings} 
            disabled={saving}
            variant="outline"
            size="sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Refresh Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};