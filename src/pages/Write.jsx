import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Write.css'; // ⭐️ MyPage.css 대신 Write.css를 임포트합니다. ⭐️
import BackButton from '../components/BackButton';

export default function Write() {
  const [zones, setZones] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    min_price: '',
    deadline: '',
    zone_id: '',
  });

  useEffect(() => {
    // ⭐️ 환경 변수 사용 ⭐️
    fetch(`${import.meta.env.VITE_API_URL}/api/zones`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // 백엔드 응답이 { zones: [...] } 형태일 경우
        const fetchedZones = data.zones || data; 
        setZones(fetchedZones);
        // 기본값 설정: 첫 번째 존을 기본으로 선택
        if (fetchedZones.length > 0 && !form.zone_id) {
          setForm(prev => ({ ...prev, zone_id: fetchedZones[0].id.toString() })); // 문자열로 변환하여 select value에 맞춤
        }
      })
      .catch(err => {
        console.error('❌ 존 목록 불러오기 실패:', err);
        alert('지역 목록을 불러오는 데 실패했습니다.');
      });
  }, []); // form.zone_id가 useEffect의 의존성 배열에 없어야 무한 루프가 발생하지 않습니다.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 유효성 검사 (프론트엔드에서 한 번 더)
    if (!form.title || !form.min_price || !form.deadline || !form.zone_id) {
        alert('모든 필수 필드를 입력해주세요.');
        return;
    }

    // min_price와 zone_id는 숫자로 변환
    const submissionForm = {
        ...form,
        min_price: parseInt(form.min_price, 10),
        zone_id: parseInt(form.zone_id, 10),
        deadline: new Date(form.deadline).toISOString(), // ISO 8601 형식으로 변환
    };

    try {
      // ⭐️ 환경 변수 사용 ⭐️
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionForm), // 변환된 form 사용
      });

      if (res.ok) {
        alert('✅ 글이 성공적으로 등록되었습니다!');
        navigate('/main'); // react-router-dom의 navigate 사용
      } else {
        const errorData = await res.json();
        alert(`❌ 등록 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('❗ 글 등록 중 에러 발생:', err);
      alert('❗ 에러 발생: 글 등록에 실패했습니다.');
    }
  };

  return (
    <div className="write-container"> {/* ✅ 클래스 이름 변경 */}
      <header className="write-header"> {/* ✅ 클래스 이름 변경 */}
        <h2>📝 글쓰기</h2>
        <BackButton /> {/* BackButton 컴포넌트 재사용 */}
      </header>

      <section className="write-form-section"> {/* ✅ 폼 섹션 래퍼 추가 */}
        <form className="write-form" onSubmit={handleSubmit}> {/* ✅ 폼 클래스 추가 */}
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="게시글 제목을 입력하세요."
          />

          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            name="content"
            rows="5"
            required
            value={form.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요."
          />

          <label htmlFor="min_price">최소 주문 금액</label>
          <input
            type="number"
            id="min_price"
            name="min_price"
            required
            value={form.min_price}
            onChange={handleChange}
            placeholder="최소 주문 금액을 입력하세요."
            min="0" // 음수 입력 방지
          />

          <label htmlFor="deadline">마감일</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            required
            value={form.deadline}
            onChange={handleChange}
          />

          <label htmlFor="zone_id">밥풀존 선택</label>
          <select
            id="zone_id"
            name="zone_id"
            required
            value={form.zone_id}
            onChange={handleChange}
          >
            <option value="">지역을 선택해주세요</option> {/* 기본 옵션 추가 */}
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.address})
              </option>
            ))}
          </select>

          <button type="submit">등록하기</button> {/* ✅ 버튼 스타일은 CSS에서 정의됨 */}
        </form>
      </section>
    </div>
  );
}
