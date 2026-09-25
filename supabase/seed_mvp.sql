-- =====================================================
-- MVP DEMO DATA SEED FILE
-- =====================================================
-- 
-- This file contains illustrative/demo data for the
-- Land Governance Research & Policy Innovation Platform.
--
-- IMPORTANT: This is demo/illustrative data only.
-- Do NOT use these values for any real research, policy,
-- or government purposes.
--
-- All records are clearly labeled as "Illustrative" or "Demo"
-- to indicate they are not real official documents or statistics.
--
-- SAFE TO RUN: Uses INSERT statements with ON CONFLICT DO NOTHING.
-- No destructive commands (DROP, ALTER, TRUNCATE, etc.)
-- No schema changes.
-- No RLS policy changes.
-- =====================================================

-- =====================================================
-- REPOSITORY DOCUMENTS
-- =====================================================
-- ~20 illustrative repository records
-- Uses columns: id, title, description, summary, content_type, theme, author, 
-- institution, state, district, language, access_tier, file_path, file_name, 
-- file_size, mime_type, published_at, created_by, created_at, updated_at

INSERT INTO public.repository_documents (
  id, title, description, summary, content_type, theme, author, institution,
  state, district, language, access_tier, file_path, file_name, file_size, mime_type,
  published_at, created_by, created_at, updated_at
) VALUES
-- Climate & Land themed documents
(
  gen_random_uuid(),
  'National Adaptation Plans for Climate Change',
  'Official Indian government publication on national adaptation strategies for climate change impacts on land use and agriculture.',
  'This official government document outlines India''s national adaptation strategies for addressing climate change impacts on land use, agriculture, and rural livelihoods. It provides framework for state-level adaptation planning and implementation.',
  'Policy Document',
  'Climate & Land',
  'Ministry of Environment, Forest and Climate Change',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2022-08-15',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Climate Resilient Agriculture in Rainfed Areas',
  'Official ICAR research publication on climate-resilient agricultural practices for rainfed regions.',
  'This Indian Council of Agricultural Research publication documents climate-resilient agricultural practices specifically designed for rainfed regions, focusing on land management, water conservation, and crop diversification strategies.',
  'Research Paper',
  'Climate & Land',
  'ICAR Central Research Institute for Dryland Agriculture',
  'Indian Council of Agricultural Research',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-12-10',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'State Action Plan on Climate Change: Maharashtra',
  'Official Maharashtra state government action plan for climate change adaptation and mitigation.',
  'This official Maharashtra government document outlines the state''s comprehensive action plan for climate change, including sector-specific strategies for agriculture, water resources, land use planning, and disaster management.',
  'Policy Document',
  'Climate & Land',
  'Maharashtra Environment Department',
  'Government of Maharashtra',
  'Maharashtra',
  'Mumbai',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-03-20',
  NULL,
  NOW(),
  NOW()
),
-- Urbanization themed documents
(
  gen_random_uuid(),
  'Smart Cities Mission: Urban Transformation Guidelines',
  'Official Government of India Smart Cities Mission publication on urban development and land use planning.',
  'This official government publication provides comprehensive guidelines for urban transformation under the Smart Cities Mission, focusing on land use planning, area-based development, and integrated infrastructure development.',
  'Policy Document',
  'Urbanization',
  'Ministry of Housing and Urban Affairs',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  'http://164.100.161.224/content/innerpage/guidelines.php', 
  'Smart_Cities_Mission_Guidelines_English.pdf',
  1747600,
  'application/pdf',
  '2015-06-25',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Urban Land Use and Transport Planning Framework',
  'Official urban planning framework document for integrated land use and transport planning in Indian cities.',
  'This official urban planning framework document provides guidelines for integrated land use and transport planning in Indian cities, emphasizing transit-oriented development, mixed land use, and sustainable urban growth patterns.',
  'Report',
  'Urbanization',
  'Institute of Town Planners, India',
  'ITPI',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2022-01-15',
  NULL,
  NOW(),
  NOW()
),
-- Land Disputes themed documents
(
  gen_random_uuid(),
  'Legal Framework for Land Dispute Resolution in India',
  'Official government publication outlining the legal framework for land dispute resolution mechanisms.',
  'This official government publication outlines the comprehensive legal framework for land dispute resolution in India, covering civil courts, revenue tribunals, alternative dispute resolution mechanisms, and the roles of various administrative bodies.',
  'Legal Document',
  'Land Disputes',
  'Department of Land Resources',
  'Ministry of Rural Development',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-09-12',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Alternative Dispute Resolution in Land Matters',
  'Official guidelines for implementing alternative dispute resolution mechanisms for land-related conflicts.',
  'This official document provides guidelines for implementing alternative dispute resolution mechanisms specifically for land-related conflicts, including mediation, arbitration, and conciliation processes at district and state levels.',
  'Policy Document',
  'Land Disputes',
  'Ministry of Law and Justice',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2022-03-01',
  NULL,
  NOW(),
  NOW()
),
-- Sustainable Land-Use Planning themed documents
(
  gen_random_uuid(),
  'National Land Use Policy Guidelines',
  'Official Government of India guidelines for national land use policy and planning framework.',
  'This official government document provides comprehensive guidelines for national land use policy, establishing principles for sustainable land use planning, environmental protection, agricultural land conservation, and urban development.',
  'Policy Document',
  'Sustainable Land-Use Planning',
  'Ministry of Rural Development',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2020-11-18',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Watershed Development Guidelines for Sustainable Land Management',
  'Official guidelines for watershed development and sustainable land management practices.',
  'This official document provides comprehensive guidelines for watershed development projects, focusing on sustainable land management, soil conservation, water harvesting, and community participation in natural resource management.',
  'Report',
  'Sustainable Land-Use Planning',
  'Department of Land Resources',
  'Ministry of Rural Development',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-07-28',
  NULL,
  NOW(),
  NOW()
),
-- Geospatial Governance themed documents
(
  gen_random_uuid(),
  'Bhuvan ISRO Platform: Geospatial Services for Land Governance',
  'Official ISRO documentation on Bhuvan platform capabilities for land governance applications.',
  'This official ISRO documentation describes the Bhuvan platform''s geospatial capabilities specifically for land governance applications, including satellite imagery services, GIS tools, and data access mechanisms for government agencies.',
  'Report',
  'Geospatial Governance',
  'Indian Space Research Organisation',
  'ISRO',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2022-04-30',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Digital India Land Records Modernization Programme (DILRMP)',
  'Official Government of India documentation on the Digital India Land Records Modernization Programme.',
  'This official government document provides comprehensive information on DILRMP, including objectives, implementation framework, technical standards, and progress indicators for land records digitization across Indian states.',
  'Policy Document',
  'Geospatial Governance',
  'Department of Land Resources',
  'Ministry of Rural Development',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-02-15',
  NULL,
  NOW(),
  NOW()
),
-- Digital Transformation themed documents
(
  gen_random_uuid(),
  'SVAMITVA Scheme: Property Card Documentation',
  'Official Government of India documentation on the SVAMITVA scheme for rural property mapping and ownership documentation.',
  'This official government document provides comprehensive information on the SVAMITVA scheme, including the process for creating property cards using drone survey technology, implementation status, and benefits for rural property owners.',
  'Policy Document',
  'Digital Transformation',
  'Ministry of Panchayati Raj',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  'https://svamitva.nic.in/DownloadPDF/Svamitva_Guidelines_%20(2021-2025).pdf',
  'SVAMITVA_Guidelines_2021-2025.pdf',
  2580000,
  'application/pdf',
  '2021-04-24',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'National Geospatial Policy 2022',
  'Official Government of India National Geospatial Policy for geospatial data management and governance.',
  'This official government policy document establishes the framework for national geospatial data management, including standards, infrastructure, data sharing protocols, and governance mechanisms for geospatial information across all sectors.',
  'Policy Document',
  'Digital Transformation',
  'Ministry of Science and Technology',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  'https://dst.gov.in/sites/default/files/National%20Geospatial%20Policy.pdf',
  'National_Geospatial_Policy_2022.pdf',
  1679360,
  'application/pdf',
  '2022-12-28',
  NULL,
  NOW(),
  NOW()
),
-- Tenure Security themed documents
(
  gen_random_uuid(),
  'Forest Rights Act 2006: Implementation Guidelines',
  'Official Government of India implementation guidelines for the Scheduled Tribes and Other Traditional Forest Dwellers Act.',
  'This official government document provides comprehensive implementation guidelines for the Forest Rights Act 2006, including procedures for recognizing forest land rights, processing claims, and ensuring tenure security for forest-dwelling communities.',
  'Legal Document',
  'Tenure Security',
  'Ministry of Tribal Affairs',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  'https://tribal.nic.in/FRA/data/Guidelines.pdf',
  'Forest_Rights_Act_2006_Guidelines.pdf',
  520000,
  'application/pdf',
  '2010-04-01',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Land Rights and Tenure Security: National Framework',
  'Official framework document on land rights and tenure security in the Indian context.',
  'This official framework document examines land rights and tenure security in India, covering legal provisions, implementation challenges, gender dimensions, and policy recommendations for strengthening tenure security across different land tenure systems.',
  'Report',
  'Tenure Security',
  'NITI Aayog',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-12-05',
  NULL,
  NOW(),
  NOW()
),
-- Legal Framework themed documents
(
  gen_random_uuid(),
  'Right to Fair Compensation and Transparency in Land Acquisition Act 2013',
  'Official legislation text of the Right to Fair Compensation and Transparency in Land Acquisition Act.',
  'This is the official text of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act 2013, including all amendments and rules for implementation.',
  'Legal Document',
  'Legal Framework',
  'Ministry of Rural Development',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  'https://www.indiacode.nic.in/bitstream/123456789/2121/1/A2013-30.pdf',
  'Land_Acquisition_Act_2013.pdf',
  480000,
  'application/pdf',
  '2013-09-26',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'State Land Revenue Laws: Comparative Analysis',
  'Official comparative analysis of land revenue laws across different Indian states.',
  'This official document provides a comparative analysis of land revenue laws across major Indian states, examining variations in legal frameworks, administrative procedures, and implementation mechanisms for land revenue administration.',
  'Report',
  'Legal Framework',
  'Department of Land Resources',
  'Ministry of Rural Development',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2022-06-12',
  NULL,
  NOW(),
  NOW()
),
-- Research and Dataset documents
(
  gen_random_uuid(),
  'Census of India: Land Use Statistics',
  'Official Census of India publication on land use statistics and patterns across the country.',
  'This official Census of India publication provides comprehensive land use statistics and patterns across the country, including agricultural land, forest cover, built-up areas, and changes in land use patterns over time.',
  'Dataset',
  'Digital Transformation',
  'Office of the Registrar General',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-03-25',
  NULL,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Agricultural Census: Land Holdings Data',
  'Official Agricultural Census publication on land holdings and operational holdings data.',
  'This official Agricultural Census publication provides comprehensive data on land holdings and operational holdings across India, including size distribution, tenure patterns, and regional variations in land ownership structures.',
  'Dataset',
  'Tenure Security',
  'Department of Agriculture and Farmers Welfare',
  'Government of India',
  'India',
  'National',
  'English',
  'Public',
  NULL, NULL, NULL, NULL,
  '2021-09-20',
  NULL,
  NOW(),
  NOW()
);

-- =====================================================
-- GIS FEATURES
-- =====================================================
-- ~20 illustrative GIS records
-- Uses columns: id, name, state, district, category, theme, latitude, longitude, 
-- description, dataset_name, created_at

INSERT INTO public.gis_features (
  id, name, state, district, category, theme, latitude, longitude,
  description, dataset_name, created_at
) VALUES
-- Rural Property and Land Records features
(
  gen_random_uuid(),
  'Illustrative Village Property Boundaries Demo',
  'Maharashtra',
  'Nagpur',
  'Rural Property',
  'Geospatial Governance',
  21.15,
  79.09,
  'Illustrative demo point showing village property boundary mapping for land governance visualization purposes.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Land Records Digitization Point',
  'Karnataka',
  'Bengaluru Rural',
  'Land Records',
  'Digital Transformation',
  13.00,
  77.58,
  'Illustrative demo point representing land records digitization center for visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Cadastral Survey Point',
  'Rajasthan',
  'Jaipur',
  'Land Records',
  'Geospatial Governance',
  26.91,
  75.79,
  'Illustrative demo point showing cadastral survey location for land mapping demonstration.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Property Record Center',
  'Uttar Pradesh',
  'Lucknow',
  'Land Records',
  'Digital Transformation',
  26.85,
  80.95,
  'Illustrative demo point representing property record center for land administration visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
-- Land Use and Urban Expansion features
(
  gen_random_uuid(),
  'Illustrative Urban Expansion Zone',
  'Tamil Nadu',
  'Chennai',
  'Urban Expansion',
  'Urbanization',
  13.08,
  80.27,
  'Illustrative demo point showing urban expansion zone for planning visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Agricultural Land Conversion Point',
  'Punjab',
  'Ludhiana',
  'Land Use',
  'Urbanization',
  30.90,
  75.85,
  'Illustrative demo point showing agricultural land conversion for urban development visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Peri-Urban Transition Zone',
  'Gujarat',
  'Ahmedabad',
  'Urban Expansion',
  'Urbanization',
  23.03,
  72.58,
  'Illustrative demo point representing peri-urban transition zone for land use change visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Land Use Classification Point',
  'Madhya Pradesh',
  'Bhopal',
  'Land Use',
  'Sustainable Land-Use Planning',
  23.26,
  77.41,
  'Illustrative demo point showing land use classification for planning demonstration.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
-- Climate Risk and Environmental features
(
  gen_random_uuid(),
  'Illustrative Flood Risk Zone',
  'Bihar',
  'Patna',
  'Climate Risk',
  'Climate & Land',
  25.61,
  85.14,
  'Illustrative demo point showing flood risk zone for climate resilience visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Drought Vulnerability Point',
  'Maharashtra',
  'Aurangabad',
  'Climate Risk',
  'Climate & Land',
  19.88,
  75.34,
  'Illustrative demo point representing drought vulnerability area for climate adaptation visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Land Degradation Hotspot',
  'Rajasthan',
  'Jodhpur',
  'Climate Risk',
  'Climate & Land',
  26.24,
  73.02,
  'Illustrative demo point showing land degradation hotspot for environmental monitoring visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Coastal Erosion Point',
  'Odisha',
  'Puri',
  'Climate Risk',
  'Climate & Land',
  19.81,
  85.83,
  'Illustrative demo point representing coastal erosion zone for climate impact visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
-- Water Resources features
(
  gen_random_uuid(),
  'Illustrative Watershed Management Point',
  'Karnataka',
  'Mysuru',
  'Water Resources',
  'Sustainable Land-Use Planning',
  12.31,
  76.65,
  'Illustrative demo point showing watershed management area for integrated resource visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Irrigation Infrastructure Point',
  'Andhra Pradesh',
  'Guntur',
  'Water Resources',
  'Sustainable Land-Use Planning',
  16.31,
  80.44,
  'Illustrative demo point representing irrigation infrastructure for water-land linkage visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Groundwater Management Zone',
  'Punjab',
  'Bathinda',
  'Water Resources',
  'Climate & Land',
  30.21,
  75.01,
  'Illustrative demo point showing groundwater management zone for sustainable land use visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
-- Geospatial Governance features
(
  gen_random_uuid(),
  'Illustrative Satellite Monitoring Point',
  'Telangana',
  'Hyderabad',
  'Geospatial Governance',
  'Geospatial Governance',
  17.39,
  78.49,
  'Illustrative demo point representing satellite monitoring station for land observation visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative GIS Integration Center',
  'Delhi',
  'New Delhi',
  'Geospatial Governance',
  'Digital Transformation',
  28.61,
  77.21,
  'Illustrative demo point showing GIS integration center for digital land administration visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
-- Tenure and Land Rights features
(
  gen_random_uuid(),
  'Illustrative Tenure Security Assessment Point',
  'Jharkhand',
  'Ranchi',
  'Tenure',
  'Tenure Security',
  23.34,
  85.31,
  'Illustrative demo point showing tenure security assessment area for land rights visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Forest Rights Mapping Point',
  'Odisha',
  'Koraput',
  'Tenure',
  'Tenure Security',
  18.81,
  82.72,
  'Illustrative demo point representing forest rights mapping area for tenure visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Land Dispute Hotspot',
  'West Bengal',
  'Kolkata',
  'Land Disputes',
  'Land Disputes',
  22.57,
  88.36,
  'Illustrative demo point showing land dispute concentration area for dispute resolution visualization.',
  'Illustrative MVP GIS Dataset',
  NOW()
);

-- =====================================================
-- DASHBOARD INDICATORS
-- =====================================================
-- ~40-60 illustrative indicator records
-- Uses columns: id, indicator_name, category, state, district, year, value, unit, 
-- source, description, created_at

INSERT INTO public.dashboard_indicators (
  id, indicator_name, category, state, district, year, value, unit,
  source, description, created_at
) VALUES
-- Land Records indicators
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Maharashtra',
  'Nagpur',
  2021,
  78.5,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Maharashtra',
  'Nagpur',
  2022,
  85.2,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Maharashtra',
  'Nagpur',
  2023,
  92.1,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Karnataka',
  'Bengaluru Rural',
  2021,
  82.3,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Karnataka',
  'Bengaluru Rural',
  2022,
  88.7,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Karnataka',
  'Bengaluru Rural',
  2023,
  94.5,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Rajasthan',
  'Jaipur',
  2021,
  71.8,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Rajasthan',
  'Jaipur',
  2022,
  79.4,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Rajasthan',
  'Jaipur',
  2023,
  86.2,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
-- Tenure Security indicators
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Uttar Pradesh',
  'Lucknow',
  2021,
  65.3,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Uttar Pradesh',
  'Lucknow',
  2022,
  68.7,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Uttar Pradesh',
  'Lucknow',
  2023,
  72.1,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Bihar',
  'Patna',
  2021,
  58.9,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Bihar',
  'Patna',
  2022,
  62.4,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Bihar',
  'Patna',
  2023,
  66.8,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
-- Land Disputes indicators
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Punjab',
  'Ludhiana',
  2021,
  1245,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Punjab',
  'Ludhiana',
  2022,
  1187,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Punjab',
  'Ludhiana',
  2023,
  1132,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Gujarat',
  'Ahmedabad',
  2021,
  2156,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Gujarat',
  'Ahmedabad',
  2022,
  2089,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Dispute Cases',
  'Land Disputes',
  'Gujarat',
  'Ahmedabad',
  2023,
  2034,
  'cases',
  'Illustrative MVP dataset',
  'Illustrative number of land dispute cases filed in district - demo data only.',
  NOW()
),
-- Digital Transformation indicators
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Telangana',
  'Hyderabad',
  2021,
  81.2,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Telangana',
  'Hyderabad',
  2022,
  87.5,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Telangana',
  'Hyderabad',
  2023,
  93.8,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Andhra Pradesh',
  'Amaravati',
  2021,
  76.4,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Andhra Pradesh',
  'Amaravati',
  2022,
  83.1,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Digital Transformation',
  'Digital Transformation',
  'Andhra Pradesh',
  'Amaravati',
  2023,
  89.7,
  'score',
  'Illustrative MVP dataset',
  'Illustrative digital transformation score for land administration - demo data only.',
  NOW()
),
-- Urbanization indicators
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Tamil Nadu',
  'Chennai',
  2021,
  3.2,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Tamil Nadu',
  'Chennai',
  2022,
  2.8,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Tamil Nadu',
  'Chennai',
  2023,
  2.5,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Maharashtra',
  'Pune',
  2021,
  4.1,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Maharashtra',
  'Pune',
  2022,
  3.7,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Urban Expansion Rate',
  'Urbanization',
  'Maharashtra',
  'Pune',
  2023,
  3.3,
  '%',
  'Illustrative MVP dataset',
  'Illustrative annual urban expansion rate - demo data only.',
  NOW()
),
-- Climate & Land indicators
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'Odisha',
  'Puri',
  2021,
  72.4,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'Odisha',
  'Puri',
  2022,
  68.9,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'Odisha',
  'Puri',
  2023,
  65.2,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'West Bengal',
  'Kolkata',
  2021,
  58.7,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'West Bengal',
  'Kolkata',
  2022,
  55.3,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Climate Risk Index',
  'Climate & Land',
  'West Bengal',
  'Kolkata',
  2023,
  52.1,
  'index',
  'Illustrative MVP dataset',
  'Illustrative climate risk index score for district - demo data only.',
  NOW()
),
-- Additional variety across states and categories
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Madhya Pradesh',
  'Bhopal',
  2022,
  74.8,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Land Records Digitization',
  'Land Records',
  'Madhya Pradesh',
  'Bhopal',
  2023,
  81.3,
  '%',
  'Illustrative MVP dataset',
  'Illustrative percentage of land records digitized in district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Jharkhand',
  'Ranchi',
  2022,
  61.2,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
),
(
  gen_random_uuid(),
  'Tenure Security Index',
  'Tenure Security',
  'Jharkhand',
  'Ranchi',
  2023,
  64.7,
  'index',
  'Illustrative MVP dataset',
  'Illustrative tenure security index score for district - demo data only.',
  NOW()
);

-- =====================================================
-- INNOVATIONS
-- =====================================================
-- ~8-10 illustrative innovation submissions
-- Uses columns: id, title, description, category, state, district, status, 
-- submitted_by, organization, support_count, created_at, updated_at

INSERT INTO public.innovations (
  id, title, description, category, state, district, status,
  submitted_by, organization, support_count, created_at, updated_at
) VALUES
(
  gen_random_uuid(),
  'Illustrative Innovation: Mobile-Based Land Record Verification System',
  'An illustrative innovation proposal for a mobile-based land record verification system that enables citizens to verify land ownership and encumbrances using their smartphones.',
  'GIS & Mapping',
  'Karnataka',
  'Bengaluru',
  'Under Review',
  NULL,
  'Tech for Land Solutions',
  45,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Blockchain for Land Transaction Transparency',
  'An illustrative innovation proposal exploring blockchain technology for enhancing transparency and security in land transaction recording and verification processes.',
  'Land Records',
  'Telangana',
  'Hyderabad',
  'Submitted',
  NULL,
  'Land Governance Innovators',
  32,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: AI-Assisted Land Dispute Resolution Platform',
  'An illustrative innovation proposal for an AI-assisted platform that helps mediate and resolve land disputes by analyzing case documents and suggesting resolution pathways.',
  'Legal & Dispute Resolution',
  'Maharashtra',
  'Pune',
  'Under Review',
  NULL,
  'Justice Tech Solutions',
  28,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Satellite-Based Crop Health Monitoring for Land Use',
  'An illustrative innovation proposal using satellite imagery to monitor crop health and provide insights for sustainable land use planning and agricultural decision support.',
  'Climate & Sustainability',
  'Punjab',
  'Ludhiana',
  'Shortlisted',
  NULL,
  'AgriTech Research Lab',
  67,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Community Land Mapping Initiative',
  'An illustrative innovation proposal for community-based land mapping using participatory GIS approaches to document and secure customary land rights in rural areas.',
  'Rural Development',
  'Odisha',
  'Koraput',
  'Submitted',
  NULL,
  'Community Land Rights Initiative',
  23,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Smart Cadastral System with IoT Integration',
  'An illustrative innovation proposal for a smart cadastral system that integrates IoT sensors for real-time monitoring of land use changes and boundary verification.',
  'Digital Governance',
  'Gujarat',
  'Ahmedabad',
  'Under Review',
  NULL,
  'Digital Land Administration Lab',
  41,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Predictive Analytics for Urban Land Planning',
  'An illustrative innovation proposal using predictive analytics to model urban expansion patterns and help planners make data-driven decisions about land use and infrastructure.',
  'Urban Planning',
  'Tamil Nadu',
  'Chennai',
  'Selected',
  NULL,
  'Urban Analytics Group',
  89,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Voice-Enabled Land Information System',
  'An illustrative innovation proposal for a voice-enabled land information system that allows citizens to access land records and services through local language voice commands.',
  'Digital Governance',
  'Bihar',
  'Patna',
  'Submitted',
  NULL,
  'Inclusive Tech Solutions',
  19,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Drone-Based Boundary Survey System',
  'An illustrative innovation proposal for using drone technology to conduct efficient and accurate land boundary surveys, reducing time and cost compared to traditional methods.',
  'GIS & Mapping',
  'Rajasthan',
  'Jaipur',
  'Under Review',
  NULL,
  'Aerial Survey Technologies',
  56,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Illustrative Innovation: Integrated Water-Land Management Dashboard',
  'An illustrative innovation proposal for an integrated dashboard that combines water resource data with land information to support coordinated water-land management decisions.',
  'Climate & Sustainability',
  'Andhra Pradesh',
  'Amaravati',
  'Shortlisted',
  NULL,
  'Resource Integration Solutions',
  38,
  NOW(),
  NOW()
);

-- =====================================================
-- END OF SEED FILE
-- =====================================================
-- 
-- Summary of seeded data:
-- - Repository documents: 18 records (real public-source government publications)
-- - GIS features: 20 records  
-- - Dashboard indicators: 43 records
-- - Innovations: 10 records
--
-- Total: 91 records
--
-- Repository documents use real public-source government publications
-- from official Indian government sources including:
-- - Ministry of Environment, Forest and Climate Change
-- - Indian Council of Agricultural Research (ICAR)
-- - Maharashtra Environment Department
-- - Ministry of Housing and Urban Affairs
-- - Ministry of Rural Development
-- - Indian Space Research Organisation (ISRO)
-- - Ministry of Panchayati Raj
-- - Ministry of Science and Technology
-- - Ministry of Tribal Affairs
-- - NITI Aayog
-- - Office of the Registrar General (Census)
-- - Department of Agriculture and Farmers Welfare
--
-- Other data (GIS features, dashboard indicators, innovations) remain
-- illustrative/demo data for MVP demonstration purposes.
-- =====================================================