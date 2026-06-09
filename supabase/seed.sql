-- Local development seed. Create Auth users before adding memberships.
insert into public.organizations (name, slug, country_code, default_timezone, default_locale)
values ('Talkque Labs', 'talkque-labs', 'US', 'UTC', 'en')
on conflict (slug) do nothing;
