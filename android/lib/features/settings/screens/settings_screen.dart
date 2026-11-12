import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _shareLive = true;
  bool _shareHistory = true;
  int _retentionDays = 7;

  @override
  Widget build(BuildContext context) {
    final authNotifier = ref.read(authProvider.notifier);
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings & Privacy')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'LOCATION SHARING CONSENT',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Share Live Location'),
                  subtitle: const Text('Allow family members to see your current pin'),
                  value: _shareLive,
                  onChanged: (v) => setState(() => _shareLive = v),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  title: const Text('Share Location History'),
                  subtitle: const Text('Allow family to view past movement breadcrumbs'),
                  value: _shareHistory,
                  onChanged: (v) => setState(() => _shareHistory = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'DATA RETENTION',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              title: const Text('Location History Retention'),
              subtitle: Text('Purge history older than $_retentionDays days'),
              trailing: DropdownButton<int>(
                value: _retentionDays,
                items: const [
                  DropdownMenuItem(value: 1, child: Text('1 Day')),
                  DropdownMenuItem(value: 3, child: Text('3 Days')),
                  DropdownMenuItem(value: 7, child: Text('7 Days')),
                  DropdownMenuItem(value: 14, child: Text('14 Days')),
                  DropdownMenuItem(value: 30, child: Text('30 Days')),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _retentionDays = v);
                },
              ),
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'ACCOUNT',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: Text(user?.fullName ?? 'User'),
                  subtitle: Text(user?.email ?? ''),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.red),
                  title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
                  onTap: () async {
                    await authNotifier.logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

