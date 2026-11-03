import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Calendar, User, Eye, ArrowRight, ArrowLeft, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface BlogPageProps {
  blogs: BlogPost[];
  selectedBlogSlug?: string;
  onSelectBlog: (slug?: string) => void;
  onNavigateToShop: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  blogs,
  selectedBlogSlug,
  onSelectBlog,
  onNavigateToShop
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [comments, setComments] = useState<Array<{ name: string; text: string; date: string }>>([
    {
      name: 'Priya Sharma',
      text: 'Such insightful perspectives on sustainable textiles. Essence proves luxury can be both timeless and kind to the environment.',
      date: '2 days ago'
    },
    {
      name: 'Aditi Rao',
      text: 'Adored the autumn color breakdown. Already styled my terracotta linen blazer with dark indigo denim!',
      date: '4 days ago'
    }
  ]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const activeArticle = selectedBlogSlug
    ? blogs.find((b) => b.slug === selectedBlogSlug)
    : null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      {
        name: commentName || 'Fashion Reader',
        text: commentText.trim(),
        date: 'Just now'
      },
      ...comments
    ]);

    setCommentSubmitted(true);
    setCommentName('');
    setCommentText('');
    setTimeout(() => setCommentSubmitted(false), 3500);
  };

  const categories = ['all', 'Sustainability', 'Trends', 'Style Guide'];
  const filteredBlogs = selectedCategory === 'all'
    ? blogs
    : blogs.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());

  // SINGLE ARTICLE VIEW
  if (activeArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
        <button
          onClick={() => onSelectBlog(undefined)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-rose-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Stories</span>
        </button>

        {/* Article Header */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {activeArticle.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-serif text-neutral-900 leading-tight">
            {activeArticle.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-neutral-400 border-b border-neutral-100 pb-4">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> By {activeArticle.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activeArticle.created_at.slice(0, 10)}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {activeArticle.views} Readers</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-100 shadow-lg">
          <img
            src={activeArticle.image}
            alt={activeArticle.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/img/bg-img/blog1.jpg';
            }}
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-6 text-sm md:text-base">
          <p className="text-lg font-serif italic text-neutral-800 leading-relaxed border-l-4 border-rose-500 pl-4">
            "{activeArticle.excerpt}"
          </p>

          <p>{activeArticle.content}</p>

          <p>
            When styling for the season ahead, prioritize high-gauge knitwear, tailored outerwear crafted from French linen blends, and sculpted footwear. The key to effortless luxury is an unhurried appreciation for tactile fabrics and silhouettes that flatter without constricting.
          </p>
        </div>

        {/* Comments Section */}
        <section className="border-t border-neutral-200 pt-10 space-y-6">
          <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-600" />
            <span>Reader Conversations ({comments.length})</span>
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Leave a Reply</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="p-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts on this story?"
              className="w-full p-3 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
            {commentSubmitted && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Your comment has been posted!
              </p>
            )}
          </form>

          {/* Comments list */}
          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-neutral-100 shadow-xs space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-900">{c.name}</span>
                  <span className="text-[10px] text-neutral-400">{c.date}</span>
                </div>
                <p className="text-xs text-neutral-600">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ALL STORIES MAGAZINE LIST VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">The Essence Editorial</span>
        <h1 className="text-3xl md:text-4xl font-black font-serif text-neutral-900">Fashion &amp; Culture Journal</h1>
        <p className="text-xs text-neutral-500">
          In-depth features on sustainable luxury, seasonal color stories, and wardrobe curation.
        </p>

        {/* Category Pills */}
        <div className="flex justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <article
            key={blog.id}
            onClick={() => onSelectBlog(blog.slug)}
            className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
          >
            <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/bg-img/blog1.jpg';
                }}
              />
              <span className="absolute top-3 left-3 bg-neutral-900/90 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded backdrop-blur-xs tracking-wider">
                {blog.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium mb-2">
                  <span>{blog.author}</span>
                  <span>&bull;</span>
                  <span>{blog.created_at.slice(0, 10)}</span>
                </div>
                <h3 className="text-lg font-bold font-serif text-neutral-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-2 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
