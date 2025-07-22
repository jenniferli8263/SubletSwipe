drop view if exists mutual_matches;

create view mutual_matches as
with scored_matches as (
  select
    r.listing_id,
    r.renter_profile_id,
    (
      case when rp.budget >= l.asking_price then 1 else 0 end +
      case when rp.num_bedrooms = l.num_bedrooms then 1 else 0 end +
      case when rp.num_bathrooms = l.num_bathrooms then 1 else 0 end +
      case when rp.building_type_id = l.building_type_id then 1 else 0 end +
      case when rp.gender = l.target_gender then 1 else 0 end +      
      case when rp.has_pet = l.pet_friendly then 1 else 0 end +
      case when l.utilities_incl = true then 1 else 0 end
    ) as compatibility_score
  from listing_on_renter r
  join renter_on_listing rl
    on r.renter_profile_id = rl.renter_profile_id
   and r.listing_id = rl.listing_id
  join listings l on r.listing_id = l.id
  join renter_profiles rp on r.renter_profile_id = rp.id
  where r.is_right = true
    and rl.is_right = true
    and l.is_active = true
    and rp.is_active = true
)

select
  listing_id,
  renter_profile_id,
  compatibility_score,
  round(compatibility_score * 100.0 / 7, 0) as compatibility_percent,
  case
    when compatibility_score = 7 then 'Perfect Match'
    when compatibility_score >= 5 then 'Strong Match'
    when compatibility_score >= 3 then 'Moderate Match'
    when compatibility_score >= 2 then 'Weak Match'
    else 'Poor Match'
  end as compatibility_label
from scored_matches;
