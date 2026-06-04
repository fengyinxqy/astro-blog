import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 搜索数据
  const allPosts: SearchResult[] = [
    {
      slug: 'hello-world',
      title: '你好，世界！我的第一篇博客',
      description: '这是我的个人博客的第一篇文章，介绍一下这个博客的搭建过程。',
      category: '随笔',
      tags: ['博客', '入门'],
    },
    {
      slug: 'astro-blog-guide',
      title: '使用 Astro 搭建个人博客完全指南',
      description: '手把手教你使用 Astro 框架搭建一个高性能的个人博客网站。',
      category: '技术',
      tags: ['Astro', '教程', '前端'],
    },
    {
      slug: 'tailwind-css-tips',
      title: 'Tailwind CSS 实用技巧总结',
      description: '分享一些 Tailwind CSS 的实用技巧和最佳实践。',
      category: '技术',
      tags: ['CSS', 'Tailwind', '前端'],
    },
  ];

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const filtered = allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          post.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  // 快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 监听自定义事件
  useEffect(() => {
    const handleToggleSearch = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('toggle-search', handleToggleSearch);
    return () => window.removeEventListener('toggle-search', handleToggleSearch);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = `/blog/${results[selectedIndex].slug}`;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const container = resultsRef.current;
        const elemTop = selectedElement.offsetTop;
        const elemBottom = elemTop + selectedElement.offsetHeight;
        if (elemBottom > container.scrollTop + container.clientHeight) {
          container.scrollTop = elemBottom - container.clientHeight;
        } else if (elemTop < container.scrollTop) {
          container.scrollTop = elemTop;
        }
      }
    }
  }, [selectedIndex]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          style={{
            background: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            fontWeight: 600,
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* 搜索框 */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* 搜索输入 */}
        <div
          className="flex items-center px-4"
          style={{ borderBottom: `1px solid var(--color-border-light)` }}
        >
          <svg
            className="w-5 h-5 shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文章..."
            className="flex-1 px-3 py-4 bg-transparent outline-none text-base"
            style={{
              color: 'var(--color-text)',
            }}
          />
          <kbd
            className="hidden sm:inline-block px-2 py-1 text-xs rounded-md font-medium"
            style={{
              color: 'var(--color-text-muted)',
              background: 'var(--color-code-bg)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {isLoading ? (
            <div
              className="px-4 py-8 text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <div
                className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
              />
              <p className="mt-2">搜索中...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <a
                key={result.slug}
                href={`/blog/${result.slug}`}
                className="block px-4 py-3 transition-colors duration-150"
                style={{
                  background: index === selectedIndex
                    ? 'var(--color-primary-ghost)'
                    : 'transparent',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {highlightText(result.title, query)}
                    </h4>
                    <p
                      className="mt-1 text-xs line-clamp-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {highlightText(result.description, query)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {result.category && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{
                            background: 'var(--color-primary-soft)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {result.category}
                        </span>
                      )}
                      {result.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            background: 'var(--color-code-bg)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </a>
            ))
          ) : query.trim() ? (
            <div
              className="px-4 py-8 text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <p>未找到相关文章</p>
              <p className="mt-1 text-xs">尝试其他关键词</p>
            </div>
          ) : (
            <div
              className="px-4 py-8 text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <p>输入关键词开始搜索</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <kbd
                  className="px-2 py-1 text-xs rounded-md"
                  style={{ background: 'var(--color-code-bg)' }}
                >
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd
                  className="px-2 py-1 text-xs rounded-md"
                  style={{ background: 'var(--color-code-bg)' }}
                >
                  K
                </kbd>
                <span className="text-xs">打开搜索</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {results.length > 0 && (
          <div
            className="px-4 py-2.5"
            style={{
              borderTop: `1px solid var(--color-border-light)`,
              background: 'var(--color-bg-page)',
            }}
          >
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <div className="flex items-center gap-4">
                <span>
                  <kbd
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'var(--color-code-bg)' }}
                  >
                    ↑↓
                  </kbd>{' '}
                  导航
                </span>
                <span>
                  <kbd
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'var(--color-code-bg)' }}
                  >
                    ↵
                  </kbd>{' '}
                  打开
                </span>
                <span>
                  <kbd
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'var(--color-code-bg)' }}
                  >
                    Esc
                  </kbd>{' '}
                  关闭
                </span>
              </div>
              <span>{results.length} 个结果</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
