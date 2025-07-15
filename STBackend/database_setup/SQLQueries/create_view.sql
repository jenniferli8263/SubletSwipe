drop view if exists mutual_matches;
create view mutual_matches as
select
    r.listing_id,
    r.renter_profile_id
from listing_on_renter r
join renter_on_listing l
    on r.renter_profile_id = l.renter_profile_id
   and r.listing_id = l.listing_id
where r.is_right = true
  and l.is_right = true;
