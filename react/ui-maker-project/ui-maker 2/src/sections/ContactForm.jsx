import React from 'react';

export function ContactForm({ section }) {
  return (
    <section style={{ padding: '40px 24px', backgroundColor: '#FDF8F3' }}>
      <h2
        style={{
          fontSize: '22px',
          marginBottom: '20px',
          textAlign: 'center',
          color: '#3d1f00'
        }}
      >
        {section['form-title'] || 'Liên hệ'}
      </h2>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ maxWidth: 480, margin: '0 auto', display: 'grid', gap: '12px' }}
      >
        <input
          type="text"
          placeholder="Họ và tên"
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
        <textarea
          placeholder="Nội dung"
          rows={4}
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#8B4513',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Gửi
        </button>
      </form>
    </section>
  );
}
