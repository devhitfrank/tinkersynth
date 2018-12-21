// @flow
import React from 'react';
import styled from 'styled-components';

import Screw from './Screw';
import { range } from '../../utils';

type Props = {
  numOfScrews?: number,
};

const ScrewRow = ({ numOfScrews = 3 }: Props) => {
  return (
    <Wrapper>
      {range(numOfScrews).map(i => (
        <Screw key={i} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  height: 17px;
`;

export default ScrewRow;