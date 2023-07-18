// Function to populate the category type select options
async function populateCategoryTypes() {
  try {
    const response = await fetch('/categoryTypes');
    const categoryTypes = await response.json();

    if (!response.ok) {
      throw new Error(categoryTypes.error || 'Failed to fetch category types');
    }

    const categoryTypeSelect = document.getElementById('categoryType');

    categoryTypes.forEach(categoryType => {
      const option = document.createElement('option');
      option.value = categoryType;
      option.textContent = categoryType;
      categoryTypeSelect.appendChild(option);
    });

    // Automatically fetch and display data when category type is selected
    categoryTypeSelect.addEventListener('change', fetchData);

    // Fetch and display data for the initial selected category type
    fetchData();
  } catch (error) {
    console.error('Error:', error.message);
    alert('An error occurred while fetching category types.');
  }
}

// Function to fetch data from the server and populate the form
async function fetchData() {
  const categoryType = document.getElementById('categoryType').value;
  const url = `/data?categoryType=${encodeURIComponent(categoryType)}`;
  const additionalDataUrl = `/additionalData?categoryType=${encodeURIComponent(categoryType)}`;

  try {
    const [response, additionalDataResponse] = await Promise.all([
      fetch(url),
      fetch(additionalDataUrl)
    ]);

    const data = await response.json();
    const additionalData = await additionalDataResponse.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch data');
    }

    if (!additionalDataResponse.ok) {
      throw new Error(additionalData.error || 'Failed to fetch additional data');
    }

    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = '';

    if (Object.keys(data).length > 0) {
      const dataTable = createDataTable(data);
      dataContainer.appendChild(dataTable);
    } else {
      dataContainer.textContent = 'No data found for the selected category.';
    }

    const additionalDataContainer = document.getElementById('additionalDataContainer');
    additionalDataContainer.innerHTML = '';

    if (!additionalData.error) {
      const additionalDataTable = createAdditionalDataTable(additionalData);
      additionalDataContainer.appendChild(additionalDataTable);
    } else {
      additionalDataContainer.textContent = additionalData.error;
    }
  } catch (error) {
    console.error('Error:', error.message);
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.textContent = 'An error occurred while fetching data.';

    const additionalDataContainer = document.getElementById('additionalDataContainer');
    additionalDataContainer.textContent = 'An error occurred while fetching additional data.';
  }

}

// Helper function to create the data table
function createDataTable(data) {
  const dataTable = document.createElement('table');
  dataTable.classList.add('data-table');

  // Create the table rows for columns and values
  Object.entries(data).forEach(([column, value]) => {
    const row = document.createElement('tr');

    const columnCell = document.createElement('td');
    columnCell.textContent = column;
    row.appendChild(columnCell);

    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    row.appendChild(valueCell);

    dataTable.appendChild(row);
  });

  return dataTable;
}

// Helper function to create the additional data table
function createAdditionalDataTable(additionalData) {
  const additionalDataTable = document.createElement('table');
  additionalDataTable.classList.add('data-table');

  // Create the table rows for headers and values
  Object.entries(additionalData).forEach(([header, value]) => {
    const row = document.createElement('tr');

    const headerCell = document.createElement('td');
    headerCell.textContent = header;
    row.appendChild(headerCell);

    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    row.appendChild(valueCell);

    additionalDataTable.appendChild(row);
  });

  return additionalDataTable;
}


// Populate the category type select options and fetch data for the initial selected category type
populateCategoryTypes();



function enableDisableFields() {
  var statusType = document.getElementById("statusType").value;
  var numberOfChildrenInput = document.getElementById("numberOfChildren");
  var numberOfDirectParentsInput = document.getElementById("numberOfDirectParents");
  var numberOfDirectParentsInLawInput = document.getElementById("numberOfDirectParentsInLaw");

  if (statusType === "select") {
    numberOfChildrenInput.disabled = false;
    numberOfDirectParentsInput.disabled = false;
    numberOfDirectParentsInLawInput.disabled = false;
  }
  else if(statusType === "single" ) {
    numberOfChildrenInput.disabled = true;
    numberOfDirectParentsInput.disabled = false;
    numberOfDirectParentsInLawInput.disabled = true;
  } else if (statusType === "married") {
    numberOfChildrenInput.disabled = false;
    numberOfDirectParentsInput.disabled = false;
    numberOfDirectParentsInLawInput.disabled = false;
  } else {
    numberOfChildrenInput.disabled = false;
    numberOfDirectParentsInput.disabled = false;
    numberOfDirectParentsInLawInput.disabled = true;
  }

  // Restrict the input to a maximum value of 2 for numberOfDirectParents and numberOfDirectParentsInLaw
  numberOfDirectParentsInput.addEventListener("input", function() {
    if (this.value > 2) {
      this.value = "";
    }
  });

  numberOfDirectParentsInLawInput.addEventListener("input", function() {
    if (this.value > 2) {
      this.value = "";
    }
  });
  numberOfChildrenInput.addEventListener("input", function(){
    if (this.value > 20){
      this.value = "";
    }
  });
}

// Attach an event listener to the statusType select element
document.getElementById("statusType").addEventListener("change", enableDisableFields);

// Call the function initially to apply the logic based on the initial value
enableDisableFields();



// Function to handle status type change
function handleStatusTypeChange() {
  // Reset the calculated values
  document.getElementById("riskPremiumMonthly").textContent = "";
  document.getElementById("riskPremiumAnnual").textContent = "";
  document.getElementById("savingPremiumMonthly").textContent = "";
  document.getElementById("savingPremiumAnnual").textContent = "";
  document.getElementById("totalPremiumMonthly").textContent = "";
  document.getElementById("totalPremiumAnnual").textContent = "";

  // Reset the input values
  document.getElementById("numberOfDirectParents").value = "";
  document.getElementById("numberOfDirectParentsInLaw").value = "";
  document.getElementById("numberOfChildren").value = "";
}

// Function to calculate results
function calculateResults() {
  var statusType = document.getElementById("statusType").value;
  var categoryType = document.getElementById("categoryType").value;
  var numberOfDirectParents = parseInt(document.getElementById("numberOfDirectParents").value) || 0;
  var numberOfDirectParentsInLaw = parseInt(document.getElementById("numberOfDirectParentsInLaw").value) || 0;
  var numberOfChildren = parseInt(document.getElementById("numberOfChildren").value) || 0;

  // Clear the calculated values
  document.getElementById("riskPremiumMonthly").textContent = "";
  document.getElementById("riskPremiumAnnual").textContent = "";
  document.getElementById("savingPremiumMonthly").textContent = "";
  document.getElementById("savingPremiumAnnual").textContent = "";
  document.getElementById("totalPremiumMonthly").textContent = "";
  document.getElementById("totalPremiumAnnual").textContent = "";

  if (statusType && categoryType && numberOfDirectParents >= 0 && numberOfDirectParentsInLaw >= 0 && numberOfChildren >= 0) {

    // Construct the API endpoint URL with the categoryType parameter
    var apiUrl = `/additionalData?categoryType=${categoryType}`;

    // Fetch the data from the API endpoint
    fetch(apiUrl)
      .then(response => response.json())
      .then(additionalData => {
        var monthlyPremium = additionalData.MonthlyPremium || 0;
        var MonthlyAddPremium = additionalData.MonthlyAddPremium || 0;
        var AnnualyAddPremium = additionalData.AnnualyAddPremium || 0;
        var monthlyAddPmParent = additionalData.MonthlyAddPmParent || 0;
        var monthlyMinSavings = additionalData.MonthlyMinSavings || 0;
        var AnnualyPremium = additionalData.AnnualyPremium || 0;
        var AnnualyMinSavings = additionalData.AnnualyMinSavings || 0;
        var BaseKids = additionalData.BaseKids || 0;

        // Update the Monthly and Annual Risk Premium values with the selected category type premiums
        document.getElementById("riskPremiumMonthly").textContent = monthlyPremium.toLocaleString();
        document.getElementById("riskPremiumAnnual").textContent = AnnualyPremium.toLocaleString();

        // Apply logic based on the status type
        if (statusType === "single") {
          if (numberOfDirectParents === 1 || numberOfDirectParents === 2) {
            monthlyPremium = monthlyPremium;
            AnnualyPremium = AnnualyPremium;
          }
        } else if (statusType === "married") {
          var additionalChildren = Math.max(numberOfChildren - BaseKids, 0); // Calculate the additional children count starting from the fourth child

          // Calculate premium for children
          var childrenMonthlyPremium = 0;
          var childrenAnnualPremium = 0;
          if (additionalChildren > 0) {
            childrenMonthlyPremium += additionalChildren * MonthlyAddPremium;
            childrenAnnualPremium += additionalChildren * AnnualyAddPremium;
          }

          // Add premium for additional children
          monthlyPremium += childrenMonthlyPremium;
          AnnualyPremium += childrenAnnualPremium;

          if (numberOfDirectParents === 1 || numberOfDirectParents === 2) {
            monthlyPremium += monthlyAddPmParent;
            AnnualyPremium += monthlyAddPmParent * 12;
          }
        
          if (numberOfDirectParentsInLaw === 1 || numberOfDirectParentsInLaw === 2) {
            monthlyPremium += monthlyAddPmParent;
            AnnualyPremium += monthlyAddPmParent * 12;
          }
        } else if (statusType === "other") {
          // Logic for other status type
          var additionalChildren = Math.max(numberOfChildren - BaseKids, 0); // Calculate the additional children count starting from the fourth child

          // Calculate premium for children
          var childrenMonthlyPremium = 0;
          var childrenAnnualPremium = 0;
          if (additionalChildren > 0) {
            childrenMonthlyPremium += additionalChildren * MonthlyAddPremium;
            childrenAnnualPremium += additionalChildren * AnnualyAddPremium;
          }
          // Add premium for additional children
          monthlyPremium += childrenMonthlyPremium;
          AnnualyPremium += childrenAnnualPremium;

          if (numberOfDirectParents === 1 || numberOfDirectParents === 2) {
            monthlyPremium += monthlyAddPmParent;
            AnnualyPremium += monthlyAddPmParent * 12;
          }
        }

        // Calculate the Risk Premium based on the adjusted monthlyPremium value
        var riskPremium = monthlyPremium;

        // Calculate the Saving Premium as the MonthlyMinSavings
        var savingPremiumMonthly = monthlyMinSavings;

        // Calculate the Total Premium as the sum of Risk Premium and Saving Premium
        var totalPremiumMonthly = riskPremium + savingPremiumMonthly;

        // Update the values in the static HTML table
        document.getElementById("riskPremiumMonthly").textContent = riskPremium.toLocaleString();
        document.getElementById("riskPremiumAnnual").textContent = AnnualyPremium.toLocaleString();
        document.getElementById("savingPremiumMonthly").textContent = savingPremiumMonthly.toLocaleString();
        document.getElementById("savingPremiumAnnual").textContent = AnnualyMinSavings.toLocaleString();
        document.getElementById("totalPremiumMonthly").textContent = totalPremiumMonthly.toLocaleString();
        document.getElementById("totalPremiumAnnual").textContent = (AnnualyPremium + AnnualyMinSavings).toLocaleString();

      })
      .catch(error => {
        console.error("Error fetching additional data:", error);
    });
  }
}

// Add event listeners to the input fields for immediate calculation
document.getElementById("statusType").addEventListener("change", handleStatusTypeChange);
document.getElementById("categoryType").addEventListener("change", calculateResults);
document.getElementById("numberOfDirectParents").addEventListener("input", calculateResults);
document.getElementById("numberOfDirectParentsInLaw").addEventListener("input", calculateResults);
document.getElementById("numberOfChildren").addEventListener("input", calculateResults);

// Call calculateResults initially to populate the table
calculateResults();


//codes to hide and display the additional data table
function toggleAdditionalData() {
  var showAdditionalData = document.getElementById("showAdditionalData").checked;
  var additionalDataContainer = document.getElementById("additionalDataContainer");
  additionalDataContainer.style.display = showAdditionalData ? "block" : "none";
  
  // Store the user's preference in localStorage
  localStorage.setItem("showAdditionalData", showAdditionalData);
}

// Attach an event listener to the showAdditionalData checkbox
document.getElementById("showAdditionalData").addEventListener("change", toggleAdditionalData);

// Attach an event listener to the window's load event
window.addEventListener("load", function() {
  // Get the user's preference from localStorage
  var showAdditionalData = localStorage.getItem("showAdditionalData");
  
  // Set the checkbox state based on the stored preference
  document.getElementById("showAdditionalData").checked = showAdditionalData === "true";
  
  // Call the function initially to set the initial visibility
  toggleAdditionalData();

  // Hide additional data when page is refreshed and checkbox was checked
  if (showAdditionalData === "true") {
    var additionalDataContainer = document.getElementById("additionalDataContainer");
    additionalDataContainer.style.display = "none";
    
    // Reset the checkbox
    document.getElementById("showAdditionalData").checked = false;
    
    // Update the stored preference
    localStorage.setItem("showAdditionalData", false);
  }
});





