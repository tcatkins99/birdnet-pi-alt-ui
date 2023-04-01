import { useState } from 'react';
import { Accordion, Badge, Button, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { OverviewStatItem } from '../components/HomepageStats';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { BirdsQuery, RecentsResponse, ResultItem, SpeciesListItem } from '../types/BirdnetPi';
import type { Option } from 'react-bootstrap-typeahead/types/types';
import { useAppSelector } from '../store/Store';
import { format } from 'date-fns';
import { useStatsQuery } from '../hooks/useStatsQuery';
import { DetectedItemsList } from '../components/DetectedItemsList';
import { FlickrThumbnailImage } from '../components/FlickrThumbnailImage';
import { formatNumber } from '../helpers/helpers';

const sortSpecies = (a: SpeciesListItem, b: SpeciesListItem): number => {
    if (a.comName > b.comName) {
        return 1;
    }

    if (a.comName < b.comName) {
        return -1;
    }

    return 0;
};

const StatsFilterControls = (props: { onSubmit: (queryData: BirdsQuery) => void }): JSX.Element => {
    const now = format(new Date(), 'yyyy-MM-dd');

    const [startDate, setStartDate] = useState<string | undefined>(now);
    const [endDate, setEndDate] = useState<string | undefined>(now);
    const [selectedSpecies, setSelectedSpecies] = useState<Option[] | undefined>();
    const overviewStats = useAppSelector((state) => state.overviewStats.value);

    const onStartChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        setStartDate(evt.currentTarget.value);
    };

    const onEndChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        setEndDate(evt.currentTarget.value);
    };

    const onSpeciesChange = (selected: Option[]): void => {
        setSelectedSpecies(selected);
    };

    const onSubmit = (evt: React.FormEvent<HTMLFormElement>): void => {
        evt.preventDefault();

        const sciNames = (selectedSpecies as ResultItem[])?.map((s) => {
            return s.sciName;
        });

        const queryData = {
            startDate,
            endDate,
            sciNames,
        };
        props.onSubmit(queryData);
    };

    // Since the speciesAllTime array is a nested property,
    // we have to extract it to a standalone array in order to sort it.
    const options = overviewStats?.stats.speciesAllTime
        ? [...overviewStats.stats.speciesAllTime]
        : undefined;

    return (
        <Form onSubmit={onSubmit}>
            <Row>
                <Col sm={4} md={3}>
                    <Form.Label className="small">Start Date</Form.Label>
                    <Form.Control type="date" value={startDate} onChange={onStartChange} />
                </Col>
                <Col sm={4} md={3}>
                    <Form.Label className="small">End Date</Form.Label>
                    <Form.Control type="date" value={endDate} onChange={onEndChange} />
                </Col>
                <Col>
                    <Form.Label className="small">Species</Form.Label>
                    {options ? (
                        <Typeahead
                            id="spcies-options"
                            multiple
                            options={options.sort(sortSpecies)}
                            onChange={onSpeciesChange}
                            placeholder="Choose Species"
                            labelKey="comName"
                            renderMenuItemChildren={(option, props, index): JSX.Element => {
                                const item = option as ResultItem;
                                return (
                                    <div>
                                        {item.comName} ({item.sciName})
                                    </div>
                                );
                            }}
                        />
                    ) : null}
                </Col>
            </Row>
            <div className="d-flex justify-content-end mt-2">
                <Button type="submit">Search</Button>
            </div>
        </Form>
    );
};

const consolidateResults = (
    results: ResultItem[],
): {
    [comName: string]: ResultItem[];
} => {
    const consolidated: { [comName: string]: ResultItem[] } = {};

    results.forEach((item) => {
        const comName = item.comName;

        if (!(comName in consolidated)) {
            consolidated[comName] = [];
        }

        consolidated[comName].push(item);
    });

    return consolidated;
};

const ResultAccordion = (props: { comName: string; results: ResultItem[] }): JSX.Element => {
    const { comName } = props;
    const [results, setResults] = useState<ResultItem[]>();

    const onEnter = (node: HTMLElement, isAppearing: boolean): void => {
        setResults(props.results);
    }

    return (
        <Accordion className="mb-2">
            <Accordion.Item eventKey={comName}>
                <Accordion.Header >
                    <div className="d-flex justify-content-between w-100 align-items-center me-2">
                        <div className="d-flex align-items-center">
                            <FlickrThumbnailImage
                                recentItem={props.results[0]}
                                className="me-2"
                                height={38}
                                width={38}
                            />
                            <h6 className="mb-0">{comName}</h6>
                        </div>
                        <div>
                            <Badge pill>{formatNumber(props.results.length, 0)}</Badge>
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Body onEnter={onEnter}>
                    <ListGroup className='align-items-center'>
                        <DetectedItemsList results={results} />
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

const SearchResultsStatsSummary = (props: {
    total: number;
    distinctSpecies: number;
}): JSX.Element => {
    return (
        <ListGroup horizontal>
            <OverviewStatItem name="Total" value={props.total}></OverviewStatItem>
            <OverviewStatItem name="Species" value={props.distinctSpecies}></OverviewStatItem>
        </ListGroup>
    );
};

const SearchResults = (props: { data?: RecentsResponse | null}): JSX.Element | null => {
    const { data } = props;

    if (data?.results.length) {
        const numResults = data.results.length;
        const consolidated = consolidateResults(data.results);

        return (
            <>
                <div className="mb-2 d-flex justify-content-center">
                    <SearchResultsStatsSummary
                        total={numResults}
                        distinctSpecies={Object.keys(consolidated).length}
                    />
                </div>

                {Object.keys(consolidated).map((comName, idx) => {
                    return (
                        <ResultAccordion
                            key={`${idx}_${comName}`}
                            comName={comName}
                            results={consolidated[comName]}
                        />
                    );
                })}
            </>
        );
    }

    return null;
};

export const Search = (): JSX.Element => {
    const [queryData, setQueryData] = useState<BirdsQuery>();
    const { data } = useStatsQuery(queryData);

    const onSubmit = (data: BirdsQuery): void => {
        setQueryData(data);
    };

    return (
        <>
            <StatsFilterControls onSubmit={onSubmit} />

            <SearchResults data={data} />
        </>
    );
};
