import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import api from '../../api/axios';

export default function UserAdminScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/v1/users/all-users');
      setUsers(data.users || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = users.filter((u) => {
    if (filterRole !== 'All' && u.role !== filterRole.toLowerCase()) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        await api.put(`/api/v1/users/update-user/${editingUser.id}`, payload);
      } else {
        await api.post('/api/v1/users/register-user', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/users/delete-user/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
    >
      <View style={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search users..."
            style={{
              flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 12, padding: 12, fontSize: 14, marginRight: 12,
            }}
          />
          <TouchableOpacity onPress={openCreate} style={{ backgroundColor: '#059669', padding: 12, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['All', 'Admin', 'User'].map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setFilterRole(role)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: filterRole === role ? '#059669' : '#fff',
                borderWidth: 1, borderColor: '#e5e7eb',
              }}
            >
              <Text style={{ color: filterRole === role ? '#fff' : '#374151', fontWeight: '500' }}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.map((user) => (
          <View key={user.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{user.name}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>{user.email}</Text>
              </View>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                marginRight: 8,
              }}>
                <Text style={{ fontSize: 12, color: user.role === 'admin' ? '#2563eb' : '#6b7280' }}>{user.role}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewUser(user)} style={{ padding: 6 }}>
                <Text style={{ color: '#059669' }}>View</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity onPress={() => openEdit(user)} style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 6, flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#2563eb', fontSize: 12 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(user.id)} style={{ padding: 6, backgroundColor: '#fee2e2', borderRadius: 6, flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Modal visible={!!viewUser} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>User Details</Text>
            {viewUser && (
              <>
                <Text style={detailStyle}>ID: {viewUser.id}</Text>
                <Text style={detailStyle}>Name: {viewUser.name}</Text>
                <Text style={detailStyle}>Email: {viewUser.email}</Text>
                <Text style={detailStyle}>Role: {viewUser.role}</Text>
                <Text style={detailStyle}>Joined: {new Date(viewUser.createdAt).toLocaleDateString()}</Text>
              </>
            )}
            <TouchableOpacity onPress={() => setViewUser(null)} style={{ marginTop: 16, backgroundColor: '#059669', padding: 12, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
              {editingUser ? 'Edit User' : 'Add User'}
            </Text>

            {['name', 'email', ...(editingUser ? [] : ['password'])].map((field) => (
              <View key={field}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginTop: 8, marginBottom: 4 }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <TextInput
                  value={form[field]} onChangeText={(t) => setForm((p) => ({ ...p, [field]: t }))}
                  placeholder={field} secureTextEntry={field === 'password'}
                  autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                  style={{
                    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
                    padding: 10, fontSize: 14, backgroundColor: '#f9fafb',
                  }}
                />
              </View>
            ))}

            <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginTop: 12, marginBottom: 4 }}>Role</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['user', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role} onPress={() => setForm((p) => ({ ...p, role }))}
                  style={{
                    flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                    backgroundColor: form.role === role ? '#059669' : '#f3f4f6',
                  }}
                >
                  <Text style={{ color: form.role === role ? '#fff' : '#374151', fontWeight: '500' }}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const detailStyle = { fontSize: 14, color: '#374151', marginBottom: 6 };
