import pandas as pd

df = pd.read_csv('California_Fire_Incidents.csv')

# convert 'Started' and 'Extinguished' to datetime
df['Started'] = pd.to_datetime(df['Started'], errors='coerce')
df['Extinguished'] = pd.to_datetime(df['Extinguished'], errors='coerce')

# fill out missing values with 0 and convert to int
impact_columns = ['Fatalities', 'Injuries', 'StructuresDamaged', 'StructuresDestroyed', 'StructuresThreatened']
for col in impact_columns:
    df[col] = df[col].fillna(0).astype(int)

# fill out missing 'AcresBurned' and 'PercentContained' with their median values
df['AcresBurned'] = df['AcresBurned'].fillna(df['AcresBurned'].median())
df['PercentContained'] = df['PercentContained'].fillna(df['PercentContained'].median())

# drop columns with excessive missing values or those not directly used
columns_to_drop = [
    'AirTankers', 'CrewsInvolved', 'Dozers', 'Engines', 'Helicopters', 'PersonnelInvolved', 'WaterTenders',
    'StructuresEvacuated', 'ConditionStatement', 'ControlStatement', 'FuelType',
    'CanonicalUrl', 'SearchDescription', 'SearchKeywords'
]
df = df.drop(columns=columns_to_drop, errors='ignore')

# clean the 'Counties' column to extract only the first county
df['Counties'] = df['Counties'].apply(lambda x: str(x).split(',')[0].strip() if pd.notnull(x) else x)

# save the cleaned data to a new csv file
df.to_csv('california_fire_cleaned.csv', index=False)