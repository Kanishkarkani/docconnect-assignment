import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL, CURRENT_USER_ID } from '@/constants/api';
import { Palette, Typography } from '@/constants/theme';

type User = {
  _id: string;
  name: string;
  occupation: string;
  profileImage: string;
  connectionCount: number;
  requested?: boolean;
};

export default function DiscoverScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError('');

      const response = await fetch(`${API_URL}/users?currentUserId=${CURRENT_USER_ID}`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const nextUsers = Array.isArray(data.users) ? data.users : [];
      const requestedUserIds = new Set(
        Array.isArray(data.requestedUserIds) ? data.requestedUserIds : []
      );

      setUsers(
        nextUsers
          .filter((user: User) => user._id !== CURRENT_USER_ID)
          .map((user: User) => ({
            ...user,
            requested: requestedUserIds.has(user._id),
          }))
      );
    } catch (fetchError) {
      console.error('USERS FETCH ERROR:', fetchError);
      setError('Unable to load people');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const connectUser = async (userId: string) => {
    if (userId === CURRENT_USER_ID) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: CURRENT_USER_ID,
          toUserId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Connect failed: ${response.status}`);
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                requested: true,
              }
            : user
        )
      );
    } catch (fetchError) {
      console.error('CONNECT ERROR:', fetchError);
      Alert.alert('Connection failed', 'Unable to send connection request.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const pattern = query.trim().toLowerCase();
    if (!pattern) return true;

    return (
      user.name.toLowerCase().includes(pattern) ||
      user.occupation.toLowerCase().includes(pattern)
    );
  });

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.countStrip}>
        <Text style={styles.countText}>{item.connectionCount} Connects</Text>
      </View>

      <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      <Text style={[styles.name, Typography.h3]}>{item.name}</Text>
      <Text style={[styles.occupation, Typography.b2]}>{item.occupation}</Text>

      <Pressable
        style={[styles.connectButton, item.requested && styles.connectButtonDisabled]}
        onPress={() => connectUser(item._id)}
        disabled={Boolean(item.requested)}
      >
        <View style={styles.buttonContent}>
          <Image
            source={require('@/assets/icons/icon-add-user.svg')}
            style={styles.icon}
            tintColor={item.requested ? Palette.textSecondary : Palette.white}
          />
          <Text style={[styles.connectText, item.requested && styles.connectTextDisabled]}>
            {item.requested ? 'Requested' : 'Connect'}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={[styles.loadingText, Typography.b2]}>Finding people...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={[styles.errorText, Typography.b1]}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadUsers()}>
          <Text style={[styles.retryText, Typography.cta]}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search profiles, organizations…"
          placeholderTextColor={Palette.textSecondary}
          style={styles.searchInput}
        />
      </View>

      <Text style={[styles.sectionTitle, Typography.h2]}>People you may know</Text>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          loadUsers(true);
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, Typography.h3]}>No people found</Text>
            <Text style={[styles.emptyText, Typography.b2]}>Try another search term.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: Palette.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    color: Palette.textPrimary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  sectionTitle: {
    color: Palette.textPrimary,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: Palette.white,
    borderRadius: 18,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  countStrip: {
    width: '100%',
    backgroundColor: Palette.primaryLight,
    paddingVertical: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  countText: {
    color: Palette.primaryDark,
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.border,
    marginBottom: 10,
  },
  name: {
    color: Palette.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  occupation: {
    color: Palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  connectButton: {
    width: '86%',
    backgroundColor: Palette.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: Palette.backgroundLight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 14,
    height: 14,
  },
  connectText: {
    color: Palette.white,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  connectTextDisabled: {
    color: Palette.textSecondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.backgroundLight,
  },
  loadingText: {
    marginTop: 12,
    color: Palette.textSecondary,
  },
  errorText: {
    color: Palette.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Palette.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: Palette.white,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: Palette.textPrimary,
  },
  emptyText: {
    color: Palette.textSecondary,
    marginTop: 6,
  },
});
