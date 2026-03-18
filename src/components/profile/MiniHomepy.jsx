import { useState, useCallback, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { storage, ref, uploadBytes, getDownloadURL, auth } from '../../firebase';

const DEMO_POSTS = [
  {
    id: 1, name: '나', emoji: '😊',
    text: '오늘 드디어 마이가든에 탑 세웠다! 🏰 재료 모으느라 3일 걸림 ㅋㅋ 근데 레어 재료 하나도 안 나옴 ㅠ',
    time: '30분 전', likes: 12, comments: 3, liked: false, image: null,
  },
  {
    id: 2, name: '나', emoji: '😊',
    text: '마이룸 벽지 바꿨는데 어때? 밤하늘 테마로 했어 ✨ BGM은 빗소리로 설정! 완전 힐링',
    time: '3시간 전', likes: 24, comments: 7, liked: true, image: null,
  },
  {
    id: 3, name: '나', emoji: '😊',
    text: '도토리정원 시작한 지 일주일 됐다! 친구 4명 사귀고, 농장이랑 빵집 지었어. 다음 목표는 광산!',
    time: '어제', likes: 38, comments: 15, liked: false, image: null,
  },
];

export default function MiniHomepy() {
  const { state, showToast } = useApp();
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState('');
  const [showWrite, setShowWrite] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImagePick = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('5MB 이하 이미지만 올릴 수 있어요!');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, [showToast]);

  const removeImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const submitPost = useCallback(async () => {
    if (!newPost.trim() && !imageFile) return;

    setUploading(true);
    let imageUrl = null;

    try {
      if (imageFile) {
        const uid = auth.currentUser?.uid || 'anon';
        const path = `dotori_diary/${uid}/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('사진 업로드에 실패했어요 ㅠ');
      setUploading(false);
      return;
    }

    const post = {
      id: Date.now(),
      name: state.user?.displayName || '나',
      emoji: '😊',
      text: newPost.trim(),
      image: imageUrl,
      time: '방금 전',
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowWrite(false);
    setUploading(false);
    showToast(imageUrl ? '사진과 함께 게시되었어요!' : '글이 게시되었어요!');
  }, [newPost, imageFile, state.user, showToast]);

  const toggleLike = useCallback((id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  }, []);

  return (
    <div>
      {/* 프로필 히어로 */}
      <div className="profile-hero">
        <div className="profile-avatar-ring">
          😊
        </div>
        <div className="profile-name">{state.user?.displayName || '도토리'}</div>
        <div className="profile-status">도토리정원에서 열심히 꾸미는 중 🌳</div>
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-num">{posts.length}</div>
            <div className="profile-stat-label">게시글</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">4</div>
            <div className="profile-stat-label">친구</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-num">{state.dotori}</div>
            <div className="profile-stat-label">도토리</div>
          </div>
        </div>
      </div>

      {/* 글쓰기 버튼 */}
      {!showWrite ? (
        <button
          onClick={() => setShowWrite(true)}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(240,147,251,0.06))',
            border: '1px dashed rgba(102,126,234,0.3)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-dim)', fontSize: 14,
            cursor: 'pointer', marginBottom: 16,
            transition: 'all 0.2s',
          }}
        >
          ✏️ 오늘 어떤 하루를 보냈나요?
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(102,126,234,0.2)' }}>
          <textarea
            placeholder="도토리정원에서의 이야기를 들려주세요..."
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            maxLength={500}
            style={{
              width: '100%', minHeight: 100, padding: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
              resize: 'vertical', outline: 'none', lineHeight: 1.6,
              fontFamily: 'inherit',
            }}
          />
          {/* 사진 미리보기 */}
          {imagePreview && (
            <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="미리보기"
                style={{
                  maxWidth: '100%', maxHeight: 200, borderRadius: 8,
                  objectFit: 'cover', border: '1px solid var(--border-light)',
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >x</button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  fontSize: 13, color: 'var(--text-dim)',
                }}
              >
                {imagePreview ? '📷 사진 변경' : '📷 사진'}
              </button>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{newPost.length}/500</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => { setShowWrite(false); removeImage(); }}>취소</button>
              <button className="btn-send" onClick={submitPost} disabled={uploading}>
                {uploading ? '업로드중...' : '게시'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글 목록 */}
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <div className="post-avatar">{post.emoji}</div>
            <div>
              <div className="post-name">{post.name}</div>
              <div className="post-time">{post.time}</div>
            </div>
          </div>
          {post.image && (
            <img
              src={post.image}
              alt="게시물 사진"
              style={{
                width: '100%', maxHeight: 300, objectFit: 'cover',
                borderRadius: 8, marginBottom: 8,
              }}
            />
          )}
          {post.text && <div className="post-body">{post.text}</div>}
          <div className="post-actions">
            <button
              className={`post-action-btn${post.liked ? ' liked' : ''}`}
              onClick={() => toggleLike(post.id)}
            >
              {post.liked ? '💜' : '🤍'} {post.likes}
            </button>
            <button className="post-action-btn">
              💬 {post.comments}
            </button>
            <button className="post-action-btn" onClick={() => showToast('링크가 복사되었어요!')}>
              🔗 공유
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
