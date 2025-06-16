# KG Visualizer


##  Overview
KG Visualizer is a lightweight tool designed to aid in exploring and understanding knowledge graphs.
Whether you’re a data scientist, researcher, or developer, this project lets you visualize Neo4j graphs in a convenient, interactive format.
It helps illuminate relationships, identify clusters, and uncover hidden patterns within your data — all through a rich, browser-based view.

---

## Installation
To get started with KG Visualizer:

1. Clone the repository:
    ```bash
    git clone https://github.com/AmrithNiyogi/kg-visualizer.git
    cd kg-visualizer
    ```
2. Create a virtual environment (optional but recommended):
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Linux/Mac
    .\venv\Scripts\activate     # Windows
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Start the application:
    ```bash
    uvicorn app.main:app --reload
    ```

---

## Features

- Graph Visualizations:
View nodes, relationships, and properties in a clear and interactive format.

- Custom Queries:
Write custom Cypher queries against your Neo4j database and see the results rendered in real time.

- Scalable UI:
Provides a responsive UI for navigating large graphs with ease.

- API-First:
Offers a convenient API endpoint for retrieving rendered graphs.

- Framework-Agnostic:
Design lets you reuse components or connect to other services with ease.

---

## LICENSE
This project is licensed under MIT — see the [LICENSE](https://github.com/AmrithNiyogi/kg-visualizer/blob/main/LICENSE) file for details.

---

## Contribution
Contributions are welcome!
If you’d like to contribute, please:

Fork the repository.

Create a new branch with your feature or bug fix.

Open a Pull Request with a clear description of your change.
