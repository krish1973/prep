import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Luggage, 
  User, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Tag, 
  FileText,
  Filter
} from 'lucide-react';
import { Item, Bag, FamilyMember, PrepEvent } from '../../types';

interface FindItemTabProps {
  items: Item[];
  bags: Bag[];
  members: FamilyMember[];
  events: PrepEvent[];
}

export const FindItemTab: React.FC<FindItemTabProps> = ({
  items,
  bags,
  members,
  events
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesText =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.flagReason && item.flagReason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesText && matchesCat;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="space-y-5 pb-24">
      
      {/* Search Header */}
      <section className="bg-white rounded-3xl p-5 border border-warm-200/90 shadow-sm space-y-3.5">
        <div>
          <h2 className="text-base font-bold text-warm-900">"Where Is It?" Instant Lookup</h2>
          <p className="text-xs text-warm-500">
            Search across every event, suitcase, and family member.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Type 'passport', 'charger', 'hall ticket', 'jacket'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-warm-50 border border-warm-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Results List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-warm-600 uppercase tracking-wider">
            Matching Items ({filteredItems.length})
          </h3>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-warm-200 text-center space-y-2">
            <p className="text-sm font-bold text-warm-900">No items found</p>
            <p className="text-xs text-warm-500">
              Try searching with another keyword or check category filters.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const bag = bags.find((b) => b.id === item.bagId);
              const event = events.find((e) => e.id === item.eventId);
              const bagOwner = bag ? members.find((m) => m.id === bag.assignedMemberId) : null;
              const packer = members.find((m) => m.id === item.packedByMemberId);

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-2xl border border-warm-200 shadow-xs space-y-2.5 transition-all hover:border-warm-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-warm-900">{item.name}</h4>
                      <p className="text-xs text-warm-500">
                        {item.category} • {item.estimatedWeightKg} kg
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        item.packed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.packed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Packed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Not Packed Yet
                        </>
                      )}
                    </span>
                  </div>

                  {/* Bag, Location & Attribution Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-warm-100">
                    <div className="flex items-center gap-2 text-warm-700">
                      <Luggage className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        <strong>Container: </strong>
                        {bag ? bag.name : <em className="text-warm-400">Not assigned to a bag yet</em>}
                      </span>
                    </div>

                    {bagOwner && (
                      <div className="flex items-center gap-2 text-warm-700">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          <strong>Bag Owner: </strong>
                          {bagOwner.avatar} {bagOwner.name}
                        </span>
                      </div>
                    )}

                    {item.packed && packer && (
                      <div className="flex items-center gap-2 text-warm-700">
                        <Tag className="w-3.5 h-3.5 text-warm-400 shrink-0" />
                        <span>
                          <strong>Packed by: </strong>
                          {packer.avatar} {packer.name}
                        </span>
                      </div>
                    )}

                    {event && (
                      <div className="flex items-center gap-2 text-warm-700">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          <strong>Event: </strong>
                          {event.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.flagReason && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                      <strong>Security Note: </strong>
                      {item.flagReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
