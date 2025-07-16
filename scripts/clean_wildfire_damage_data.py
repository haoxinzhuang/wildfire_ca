import pandas as pd

df_damage = pd.read_csv('California Wildfire Damage.csv')

# convert 'Date' column to datetime
df_damage['Date'] = pd.to_datetime(df_damage['Date'], errors='coerce')

# rename columns to remove spaces and special characters for easier use
df_damage = df_damage.rename(columns={
    'Area_Burned (Acres)': 'Area_Burned_Acres',
    'Estimated_Financial_Loss (Million $)': 'Estimated_Financial_Loss_Million_USD'
})

# fill out missing values with 0 and convert to int
numerical_impact_cols = [
    'Homes_Destroyed', 'Businesses_Destroyed', 'Vehicles_Damaged',
    'Injuries', 'Fatalities', 'Estimated_Financial_Loss_Million_USD'
]

for col in numerical_impact_cols:
    df_damage[col] = df_damage[col].fillna(0)
    if col != 'Estimated_Financial_Loss_Million_USD': # financial loss remain float
        df_damage[col] = df_damage[col].astype(int)

# Save the cleaned DataFrame to a new CSV file
df_damage.to_csv('california_wildfire_damage_cleaned.csv', index=False)





