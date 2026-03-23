
import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { Button } from '../components/ui/Button';
import { Star, Briefcase, TrendingUp, Quote, Building } from 'lucide-react';
import api from '../lib/api';

interface SuccessStory {
   _id: string;
   name: string;
   role: string;
   company: string;
   previousRole: string;
   image: string;
   story: string;
   outcome: string;
}

interface SuccessStoriesPageProps {
   onNavigate: (view: ViewState) => void;
}

export const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({ onNavigate }) => {
   const [stories, setStories] = useState<SuccessStory[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStories = async () => {
         try {
            const res = await api.get('/success-stories');
            setStories(res.data);
         } catch (error) {
            console.error("Failed to fetch success stories:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchStories();
   }, []);

   return (
      <div className="pt-24 min-h-screen bg-white">
         {/* Hero Section */}
         <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900 to-transparent opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
               <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                  Real People. <span className="text-brand-500">Real Results.</span>
               </h1>
               <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                  Join thousands of alumni who have transformed their careers and lives through our industry-leading programs.
               </p>
               <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={() => onNavigate('courses')}>Start Your Journey</Button>
               </div>
            </div>
         </section>

         {/* Stats Section */}
         <section className="py-12 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                     <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">85%</div>
                     <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Hired within 3 Months</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">120%</div>
                     <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Avg. Salary Hike</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">500+</div>
                     <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Hiring Partners</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">10k+</div>
                     <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Alumni Network</div>
                  </div>
               </div>
            </div>
         </section>

         {/* Stories Grid */}
         <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Featured Success Stories</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">Discover how professionals from diverse backgrounds achieved their dream careers.</p>
               </div>

               {loading ? (
                  <div className="text-center py-10">Loading stories...</div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                     {stories.map((story) => (
                        <div key={story._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
                           <div className="flex flex-col sm:flex-row">
                              <div className="w-full sm:w-2/5 h-64 sm:h-auto relative">
                                 <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden"></div>
                                 <div className="absolute bottom-4 left-4 text-white sm:hidden">
                                    <p className="font-bold">{story.name}</p>
                                    <p className="text-xs opacity-90">{story.company}</p>
                                 </div>
                              </div>
                              <div className="w-full sm:w-3/5 p-8 flex flex-col justify-between">
                                 <div>
                                    <Quote size={32} className="text-brand-200 mb-4 fill-current" />
                                    <p className="text-slate-600 italic mb-6 leading-relaxed">"{story.story}"</p>
                                 </div>

                                 <div className="border-t border-slate-100 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                       <div>
                                          <p className="font-bold text-slate-900 text-lg">{story.name}</p>
                                          <p className="text-sm text-slate-500">{story.previousRole} <span className="text-brand-400">➔</span> {story.role}</p>
                                       </div>
                                       <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                                          <Building size={20} className="text-slate-400" />
                                       </div>
                                    </div>

                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                                       <TrendingUp size={14} className="mr-2" /> {story.outcome}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>

         {/* CTA */}
         <section className="py-20 bg-brand-600 text-white text-center">
            <div className="max-w-4xl mx-auto px-4">
               <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to write your own success story?</h2>
               <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                  Your dream career is just a course away. Join our next cohort and get started today.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50" onClick={() => onNavigate('get-started')}>Enroll Now</Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-brand-700" onClick={() => onNavigate('contact')}>Talk to a Counselor</Button>
               </div>
            </div>
         </section>
      </div>
   );
};

