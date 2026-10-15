import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
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
  connectionCount?: number;
};

type Post = {
  _id: string;
  content: string;
  timestamp: string;
  image?: string;
  author: User;
};

export default function HomeScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setError('');

      const [postsResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/posts`),
        fetch(`${API_URL}/users?currentUserId=${CURRENT_USER_ID}`),
      ]);

      if (!postsResponse.ok) {
        throw new Error(`Server returned ${postsResponse.status}`);
      }

      const [postsData, usersData] = await Promise.all([
        postsResponse.json(),
        usersResponse.ok ? usersResponse.json() : { users: [] },
      ]);

      setPosts(postsData);

      const self = Array.isArray(usersData.users)
        ? usersData.users.find((user: User) => user._id === CURRENT_USER_ID) || null
        : null;

      setCurrentUser(self);
    } catch (loadError) {
      console.error('HOME LOAD ERROR:', loadError);
      setError('Unable to load home feed');
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeaderRow}>
        <Image source={{ uri: item.author.profileImage }} style={styles.postAvatar} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postAuthor}>{item.author.name}</Text>
          <Text style={styles.postRole}>{item.author.occupation}</Text>
        </View>
      </View>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.postImage} contentFit="cover" />
      ) : null}

      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
    </View>
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.brandBar}>
        <Text style={[styles.brandText, Typography.h2]}>DocConnect</Text>
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: currentUser?.profileImage }} style={styles.avatar} />

        <View style={styles.profileMeta}>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{currentUser?.connectionCount ?? 0} Connects</Text>
          </View>
          <Text style={[styles.profileName, Typography.h2]}>{currentUser?.name ?? 'Profile'}</Text>
          <Text style={[styles.profileOccupation, Typography.b2]}>
            {currentUser?.occupation ?? 'Member'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={[styles.loadingText, Typography.b2]}>Loading home feed...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={[styles.errorText, Typography.b1]}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadHomeData}>
          <Text style={[styles.retryText, Typography.cta]}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
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
  listHeader: {
    backgroundColor: Palette.backgroundLight,
  },
  brandBar: {
    backgroundColor: Palette.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  brandText: {
    color: Palette.primaryDark,
  },
  profileCard: {
    backgroundColor: Palette.white,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.border,
  },
  profileMeta: {
    alignItems: 'center',
    marginTop: 12,
  },
  countPill: {
    backgroundColor: Palette.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  countPillText: {
    color: Palette.primaryDark,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  profileName: {
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  profileOccupation: {
    color: Palette.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  postCard: {
    backgroundColor: Palette.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Palette.border,
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  postAuthor: {
    color: Palette.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
  },
  postRole: {
    color: Palette.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 14,
    backgroundColor: Palette.border,
  },
  postContent: {
    color: Palette.textPrimary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  postDate: {
    color: Palette.textSecondary,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 12,
  },
});
